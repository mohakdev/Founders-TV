import React, { useEffect, useState } from "react";
import { VideoCard } from "./video-card";

export interface Video {
	id: string;
	youtubeId: string;
	title: string;
	description: string;
	thumbnailUrl: string;
	publishedAt: string | null;
	createdAt: string | null;
	viewCount: number;
	likeCount: number;
	commentCount: number;
	collectionId: string | null;
	collectionName: string | null;
}

interface VideoGridProps {
	title: string;
	// accept either a resolved array or a Promise that resolves to the array
	videos: Video[] | null | Promise<Video[] | null>;
}

export function VideoGrid({ title, videos }: VideoGridProps) {
	const [resolved, setResolved] = useState<Video[] | null>(
		Array.isArray(videos) ? (videos as Video[]) : null,
	);

	useEffect(() => {
		let mounted = true;

		if (Array.isArray(videos)) {
			setResolved(videos as Video[]);
			return;
		}

		if (
			videos &&
			typeof (videos as Promise<Video[] | null>).then === "function"
		) {
			(videos as Promise<Video[] | null>).then((v) => {
				if (mounted) setResolved(v);
			});
		} else {
			setResolved(null);
		}

		return () => {
			mounted = false;
		};
	}, [videos]);

	return (
		<section className="bg-background pl-0 pr-0 pb-24">
			<h2 className="mb-10 text-3xl font-semibold text-white">{title}</h2>

			<div className="grid bg-background grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
				{resolved?.map((video: Video) => (
					<VideoCard key={video.id} {...video} />
				))}
			</div>
		</section>
	);
}
