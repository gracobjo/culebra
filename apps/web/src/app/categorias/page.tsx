import { redirect } from "next/navigation";

/** El hub de catalogo vive en /tienda (agro + entradas turismo sin mezclar checkout). */
export default function CategoriesIndexRedirect() {
  redirect("/tienda");
}
