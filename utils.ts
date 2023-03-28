export function calculateNextReview(
	reviewCount: number,
	recurring: boolean,
	lastReview: Date
): Date {
	const days = [7, 30, 60, 90, 180, 365];
	const index = Math.min(reviewCount, days.length - 1);
	const nextReview = new Date(lastReview);

	if (recurring) {
		nextReview.setDate(nextReview.getDate() + 7);
		return nextReview;
	}

	nextReview.setDate(nextReview.getDate() + days[index]);
	return nextReview;
}
