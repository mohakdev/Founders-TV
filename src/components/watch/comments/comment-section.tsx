"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import axios from "axios";

import { CommentCard } from "./comment-card";
import { CommentInput } from "./comment-input";

interface User {
	id?: string;
	name: string;
	image?: string | null;
}

interface ApiComment {
	id: string;
	body: string;
	createdAt: string;
	updatedAt: string;
	videoId: string;
	userId: string;
	userName: string;
	userImage?: string | null;
}

export interface Comment {
	id: string;

	author: {
		id: string;
		name: string;
		image?: string | null;
	};

	content: string;

	createdAt: string;

	isOwner?: boolean;
}

interface CommentsSectionProps {
	currentUser?: User | null;
	videoId: string;
	onDeleteComment?: (commentId: string) => void;
	onLoadMore?: () => void;
	hasMore?: boolean;
}

async function fetchComments(videoId: string): Promise<ApiComment[]> {
	try {
		const response = await axios.get(`/api/videos/${videoId}/comments`);

		return response.data;
	} catch (error) {
		console.error("Error fetching comments:", error);
		return [];
	}
}

async function handleSubmitComment(body: string, videoId: string) {
	try {
		const response = await axios.post(`/api/videos/${videoId}/comments`, {
			body,
		});

		return response.data;
	} catch (error) {
		console.error("Error submitting comment:", error);
		return null;
	}
}

export function CommentsSection({
	currentUser,
	videoId,
	onDeleteComment,
	onLoadMore,
	hasMore = false,
}: CommentsSectionProps) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadComments() {
			setIsLoading(true);

			const data = await fetchComments(videoId);

			const formattedComments: Comment[] = data.map((comment) => ({
				id: comment.id,

				author: {
					id: comment.userId,
					name: comment.userName,
					image: comment.userImage ?? null,
				},

				content: comment.body,

				createdAt: comment.createdAt,

				isOwner: currentUser?.id === comment.userId,
			}));

			setComments(formattedComments);
			setIsLoading(false);
		}

		loadComments();
	}, [videoId, currentUser?.id]);

	async function submitComment(body: string) {
		if (!body.trim()) {
			return null;
		}

		const created = await handleSubmitComment(body, videoId);

		if (!created) {
			return null;
		}

		/*
		 * The POST endpoint currently returns only the newly
		 * inserted comment. The GET endpoint returns the joined
		 * user information we need, so simply refetch after
		 * creation.
		 */
		const data = await fetchComments(videoId);

		const formattedComments: Comment[] = data.map((comment) => ({
			id: comment.id,

			author: {
				id: comment.userId,
				name: comment.userName,
				image: comment.userImage ?? null,
			},

			content: comment.body,

			createdAt: comment.createdAt,

			isOwner: currentUser?.id === comment.userId,
		}));

		setComments(formattedComments);

		return created;
	}

	return (
		<section className="mt-6 w-full space-y-8">
			{/* Header */}

			<div className="flex items-center gap-3">
				<MessageCircle className="text-neutral-300" size={28} />

				<h2
					className="
                        text-2xl
                        font-bold
                        tracking-tight
                        text-white
                    "
				>
					Discussion
				</h2>

				<span
					className="
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-3
                        py-1
                        text-sm
                        text-neutral-400
                    "
				>
					{comments.length}
				</span>
			</div>

			{/* Comment Input */}

			{currentUser ? (
				<CommentInput user={currentUser} onSubmit={submitComment} />
			) : (
				<div
					className="
                        rounded-[28px]
                        border
                        border-dashed
                        border-white/10
                        bg-white/[0.03]
                        p-10
                        text-center
                    "
				>
					<p className="text-lg text-neutral-400">
						Sign in to join the discussion.
					</p>
				</div>
			)}

			{/* Comments */}

			{isLoading ? (
				<div
					className="
                        rounded-[28px]
                        border
                        border-white/10
                        bg-white/[0.03]
                        py-20
                        text-center
                    "
				>
					<p className="text-neutral-400">Loading discussion...</p>
				</div>
			) : comments.length === 0 ? (
				<div
					className="
                        rounded-[28px]
                        border
                        border-white/10
                        bg-white/[0.03]
                        py-20
                        text-center
                    "
				>
					<MessageCircle
						className="
                            mx-auto
                            mb-5
                            text-neutral-600
                        "
						size={44}
					/>

					<h3
						className="
                            text-2xl
                            font-semibold
                            text-white
                        "
					>
						Start the conversation
					</h3>

					<p
						className="
                            mt-2
                            text-neutral-400
                        "
					>
						Be the first person to share your thoughts about this
						event.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{comments.map((comment) => (
						<CommentCard
							key={comment.id}
							{...comment}
							onDelete={() => onDeleteComment?.(comment.id)}
						/>
					))}
				</div>
			)}

			{/* Load More */}

			{hasMore && (
				<div className="flex justify-center">
					<button
						onClick={onLoadMore}
						className="
                            rounded-full
                            border
                            border-white/10
                            bg-white/5
                            px-6
                            py-3
                            text-white
                            transition-all
                            duration-300
                            hover:bg-white/10
                        "
					>
						Load More Comments
					</button>
				</div>
			)}
		</section>
	);
}
