type ContestantId = { id: string };

/** Returns true only when orderIds is an exact permutation of the current cast. */
export function validatePickOrder(orderIds: readonly string[], contestants: readonly ContestantId[]) {
  if (orderIds.length !== contestants.length) return false;
  const submitted = new Set(orderIds);
  if (submitted.size !== orderIds.length) return false;
  const expected = new Set(contestants.map(({ id }) => id));
  return expected.size === contestants.length && submitted.size === expected.size
    && [...submitted].every((id) => expected.has(id));
}
