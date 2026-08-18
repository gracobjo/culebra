export {
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  revokeSession,
  seedAdminUser,
  validateCredentials,
  validateSessionToken,
} from "./auth.service.js";
export { signAccessToken, verifyAccessToken } from "./jwt.js";
export { hashPassword, verifyPassword } from "./password.js";
export { hasAllRoles, hasAnyRole, hasRole } from "./rbac.js";
export {
  emailSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordSchema,
  registerSchema,
} from "./schemas.js";
export type {
  LoginInput,
  PasswordResetRequestInput,
  RegisterInput,
} from "./schemas.js";
export type { AuthSessionResult, AuthUser, JwtPayload } from "./types.js";
export {
  acceptContractVersion,
  createContractVersionForAdmin,
  DEFAULT_CONTRACT_CONDITIONS,
  getContractById,
  getVendorContractStatus,
  listContractsForAdmin,
  publishContractVersionForAdmin,
  vendorHasActiveContract,
} from "./contract.service.js";
export type {
  AdminContractListItem,
  ContractAcceptanceRecord,
  ContractRecord,
  ContractVersionRecord,
  VendorContractStatus,
} from "./contract.service.js";
export { contractVersionCreateSchema } from "./contract.schemas.js";
export type { ContractVersionCreateInput } from "./contract.schemas.js";
export {
  applyAsVendor,
  assertVendorOwnership,
  getPublicVendorBySlug,
  getVendorById,
  getVendorByUserId,
  listPublicVendors,
  listVendorsForAdmin,
  submitVendorForReview,
  updateVendorProfile,
  updateVendorStatusByAdmin,
} from "./vendor.service.js";
export type { PublicVendorRecord, VendorRecord } from "./vendor.service.js";
export {
  slugSchema,
  vendorApplySchema,
  vendorProfileSchema,
  vendorStatusUpdateSchema,
  vendorUpdateSchema,
} from "./vendor.schemas.js";
export type {
  VendorApplyInput,
  VendorStatusUpdateInput,
  VendorUpdateInput,
} from "./vendor.schemas.js";
export { createUniqueSlug, slugify } from "./slug.js";
export {
  addCartItem,
  createCartSessionId,
  getOrCreateCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js";
export type { CartItemRecord, CartRecord } from "./cart.service.js";
export {
  addCartItemSchema,
  checkoutSchema,
  updateCartItemSchema,
} from "./cart.schemas.js";
export type {
  AddCartItemInput,
  CheckoutInput,
  UpdateCartItemInput,
} from "./cart.schemas.js";
export { checkoutCart } from "./checkout.service.js";
export type { OrderSummary } from "./checkout.service.js";
export {
  createOrderCheckoutSession,
  createVendorStripeOnboardingLink,
  getVendorStripeStatus,
  handleStripeWebhook,
  isStripeConfigured,
  markOrderPaid,
} from "./payment.service.js";
export type { VendorStripeStatus } from "./payment.service.js";
export {
  getOrderByNumber,
  getVendorOrder,
  listOrdersForUser,
  listVendorOrders,
  lookupGuestOrder,
  shipVendorOrder,
  updateVendorOrderStatus,
} from "./order.service.js";
export type {
  OrderDetail,
  OrderListItem,
  VendorOrderDetail,
} from "./order.service.js";
export {
  guestOrderLookupSchema,
  shipVendorOrderSchema,
  vendorOrderStatusSchema,
} from "./order.schemas.js";
export type {
  GuestOrderLookupInput,
  ShipVendorOrderInput,
  VendorOrderStatusInput,
} from "./order.schemas.js";
export {
  createProduct,
  disableProduct,
  getPublicProductBySlug,
  getVendorProduct,
  listProductsForAdmin,
  listPublicProducts,
  listVendorProducts,
  submitProductForReview,
  updateProduct,
  updateProductStatusByAdmin,
} from "./product.service.js";
export type { ProductRecord } from "./product.service.js";
export {
  getCategoryById,
  getCategoryBySlug,
  listCategories,
} from "./category.service.js";
export type { CategoryRecord } from "./category.service.js";
export {
  productCatalogQuerySchema,
  productCreateSchema,
  productStatusUpdateSchema,
  productUpdateSchema,
} from "./product.schemas.js";
export type {
  ProductCatalogQuery,
  ProductCreateInput,
  ProductStatusUpdateInput,
  ProductUpdateInput,
} from "./product.schemas.js";
