export function calculateNextReview(
	reviewCount: number,
	lastReview: Date
): Date {
	const days = [7, 30, 60, 90, 180, 365];
	const index = Math.min(reviewCount, days.length - 1);
	const nextReview = new Date(lastReview);

	nextReview.setDate(nextReview.getDate() + days[index]);
	return nextReview;
}
