async function autoAssign(prisma, reportId) {
  const cleaners = await prisma.user.findMany({
    where: { role: "CLEANER" },
    include: {
      tasks: {
        where: { resolvedAt: null },
      },
    },
  });

  if (!cleaners.length) {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "NEEDS_REVIEW" },
    });
    return null;
  }

  const cleaner = cleaners.sort((a, b) => a.tasks.length - b.tasks.length)[0];

  const task = await prisma.task.create({
    data: { reportId, cleanerId: cleaner.id },
  });

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "ASSIGNED" },
  });

  return task;
}

module.exports = { autoAssign };
