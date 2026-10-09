// License-leak rule of the bbj fixture (W5), kept pure so that it is unit-tested without a BBj.

/**
 * After a test has cleaned up: did it leave a BBJ license in use that was free before it started?
 *
 * @param {Set<string>|string[]} beforeIds session ids that existed before the test
 * @param {number} licensesBefore BBJ licenses in use before the test
 * @param {{ licenses: { BBJ: { inUse: number } }, processes: Array<{ id: string, program: string }> }} current
 *   the status read after the cleanup (see parseStatus in admin.js)
 * @returns {Array<{ id: string, program: string }>|null} null when no license is held over; else
 *   the sessions that are not in beforeIds (the list can be empty when the holder is not listed).
 *   Nothing is terminated here: the list only says what held the licenses.
 */
export function findLeak(beforeIds, licensesBefore, current) {
  const before = beforeIds instanceof Set ? beforeIds : new Set((beforeIds || []).map(String));
  const inUse = current && current.licenses && current.licenses.BBJ ? current.licenses.BBJ.inUse : 0;
  if (inUse <= licensesBefore) return null;
  return (current.processes || [])
    .filter((p) => !before.has(String(p.id)))
    .map((p) => ({ id: String(p.id), program: p.program }));
}
