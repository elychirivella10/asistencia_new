import prisma from "@/lib/prisma";

export const getAreaTypes = async () => {
  return await prisma.cat_tipos_area.findMany({
    orderBy: { nombre: "asc" },
  });
};

