import type { FastifyInstance, FastifyReply } from "fastify";
import { ProductStatus, UserRole } from "@culebra/domain";
import {
  createProduct,
  disableProduct,
  getPublicProductBySlug,
  getVendorProduct,
  listCategories,
  listProductsForAdmin,
  listPublicProducts,
  listVendorProducts,
  productCatalogQuerySchema,
  productCreateSchema,
  productStatusUpdateSchema,
  productUpdateSchema,
  submitProductForReview,
  updateProduct,
  updateProductStatusByAdmin,
} from "@culebra/auth";

import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handleProductError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }

  const map: Record<string, number> = {
    PRODUCT_NOT_FOUND: 404,
    PRODUCT_NOT_EDITABLE: 403,
    PRODUCT_INVALID_STATUS: 400,
    PRODUCT_INCOMPLETE: 400,
    PRODUCT_VENDOR_NOT_FOUND: 404,
    PRODUCT_VENDOR_NOT_ACTIVE: 403,
    CATEGORY_NOT_FOUND: 400,
  };

  reply.code(map[error.message] ?? 500).send({ error: error.message });
}

export async function productRoutes(app: FastifyInstance) {
  app.get("/categories", async (_request, reply) => {
    const categories = await listCategories();
    reply.send({ items: categories });
  });

  app.get("/products", async (request, reply) => {
    const parsed = productCatalogQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
      return;
    }

    const result = await listPublicProducts(parsed.data);
    reply.send(result);
  });

  app.get("/products/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const product = await getPublicProductBySlug(slug);
    if (!product) {
      reply.code(404).send({ error: "PRODUCT_NOT_FOUND" });
      return;
    }
    reply.send({ product });
  });

  app.get(
    "/vendors/me/products",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const items = await listVendorProducts(request.authUser!.id);
        reply.send({ items });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );

  app.get(
    "/vendors/me/products/:id",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const product = await getVendorProduct(request.authUser!.id, id);
        reply.send({ product });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/products",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const parsed = productCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      try {
        const product = await createProduct(request.authUser!.id, parsed.data, {
          ipAddress: request.ip,
        });
        reply.code(201).send({ product });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );

  app.patch(
    "/vendors/me/products/:id",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const parsed = productUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      try {
        const { id } = request.params as { id: string };
        const product = await updateProduct(
          request.authUser!.id,
          id,
          parsed.data,
          { ipAddress: request.ip },
        );
        reply.send({ product });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/products/:id/submit",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const product = await submitProductForReview(
          request.authUser!.id,
          id,
          { ipAddress: request.ip },
        );
        reply.send({ product });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/products/:id/disable",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const product = await disableProduct(request.authUser!.id, id, {
          ipAddress: request.ip,
        });
        reply.send({ product });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );
}

export async function adminProductRoutes(app: FastifyInstance) {
  app.get(
    "/admin/products",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const query = request.query as {
        status?: ProductStatus;
        limit?: string;
        offset?: string;
      };
      const result = await listProductsForAdmin({
        status: query.status,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });
      reply.send(result);
    },
  );

  app.patch(
    "/admin/products/:id/status",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const parsed = productStatusUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      try {
        const { id } = request.params as { id: string };
        const product = await updateProductStatusByAdmin(
          id,
          request.authUser!.id,
          parsed.data,
          { ipAddress: request.ip },
        );
        reply.send({ product });
      } catch (error) {
        handleProductError(error, reply);
      }
    },
  );
}
