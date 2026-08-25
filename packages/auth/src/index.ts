export {
  getActiveUserById,
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  revokeAllUserSessions,
  revokeSession,
  seedAdminUser,
  validateCredentials,
  validateSessionToken,
} from "./auth.service.js";
export {
  listAuditLogsForAdmin,
} from "./audit.service.js";
export type { AdminAuditLogRecord } from "./audit.service.js";
export {
  diffProductSnapshots,
  getStoredDocumentForAdmin,
  getStoredDocumentForOwner,
  listProductChangeDocuments,
  listStoredDocumentsForUser,
  productSnapshotFromRecord,
  purgeExpiredStoredDocuments,
  recordOrderDocuments,
  recordProductChangeDocument,
} from "./stored-document.service.js";
export type {
  StoredDocumentKind,
  StoredDocumentRecord,
} from "./stored-document.service.js";
export { signAccessToken, verifyAccessToken } from "./jwt.js";
export {
  sendOrderConfirmationEmail,
  sendShipmentNotificationEmail,
  sendVendorNewOrderEmail,
} from "./email.service.js";
export type {
  EmailPayload,
  OrderConfirmationData,
  ShipmentNotificationData,
  VendorNewOrderData,
} from "./email.service.js";
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
export {
  listCategoryUrlsForSitemap,
  listPublicAccommodationUrlsForSitemap,
  listPublicPackUrlsForSitemap,
  listPublicProductUrlsForSitemap,
  listPublicVendorUrlsForSitemap,
} from "./seo.service.js";
export type { SitemapUrlRecord } from "./seo.service.js";
export { createUniqueSlug, slugify } from "./slug.js";
export {
  addCartItem,
  addPackToCart,
  applyCartCoupon,
  clearCartCoupon,
  createCartSessionId,
  getOrCreateCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js";
export type { CartItemRecord, CartRecord } from "./cart.service.js";
export {
  addCartItemSchema,
  applyCartCouponSchema,
  checkoutSchema,
  updateCartItemSchema,
} from "./cart.schemas.js";
export type {
  AddCartItemInput,
  ApplyCartCouponInput,
  CheckoutInput,
  UpdateCartItemInput,
} from "./cart.schemas.js";
export { checkoutCart } from "./checkout.service.js";
export type { OrderSummary } from "./checkout.service.js";
export { computeShippingQuote } from "./shipping.service.js";
export type { ShippingQuote } from "./shipping.service.js";
export {
  CUSTOMER_SHIPPING_FEE_EUR,
  FREE_SHIPPING_THRESHOLD_EUR,
  MARKETPLACE_SHIPPING_COST_EUR,
} from "@culebra/domain";
export {
  createOrderCheckoutSession,
  createVendorStripeOnboardingLink,
  getVendorStripeStatus,
  handleStripeWebhook,
  isPayoutReleased,
  isStripeConfigured,
  markOrderPaid,
  releaseMaturedPayouts,
  retryPendingPayoutsForVendor,
} from "./payment.service.js";
export type { VendorStripeStatus } from "./payment.service.js";
export {
  getVendorPayoutStatus,
  isPayPalConfigured,
  isVendorPayoutReady,
  setVendorPayPalEmail,
  updateVendorPayoutMethod,
} from "./vendor-payout.service.js";
export type { VendorPayoutStatus } from "./vendor-payout.service.js";
export { listPayoutsForAdmin, listPayoutsForVendor } from "./payout.service.js";
export type { PayoutRecord } from "./payout.service.js";
export {
  createCommissionRuleForAdmin,
  DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
  DEFAULT_MIN_COMMISSION_EUR,
  ensureDefaultCommissionRuleForVendor,
  getActiveCommissionRules,
  getEffectiveCommissionPercent,
  listCommissionRulesForUser,
  listCommissionRulesForVendor,
  setVendorCommissionPercentForAdmin,
} from "./commission.service.js";
export type {
  CommissionRuleRecord,
  EffectiveCommission,
  LineCommission,
  VendorCommissionBreakdown,
} from "./commission.service.js";
export { commissionRuleCreateSchema } from "./commission.schemas.js";
export type { CommissionRuleCreateInput } from "./commission.schemas.js";
export {
  getAdminDashboardStats,
  listUsersForAdmin,
  updateUserStatusByAdmin,
} from "./admin.service.js";
export type { AdminDashboardStats, AdminUserRecord } from "./admin.service.js";
export {
  getOrderByNumber,
  getOrderByNumberForAdmin,
  getVendorOrder,
  listOrdersForAdmin,
  listOrdersForUser,
  listVendorOrders,
  lookupGuestOrder,
  shipVendorOrder,
  updateVendorOrderStatus,
} from "./order.service.js";
export type {
  AdminOrderListItem,
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
  updateProductCommercialData,
  updateProductStock,
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
  productCommercialUpdateSchema,
  productCreateSchema,
  productStatusUpdateSchema,
  productStockUpdateSchema,
  productUpdateSchema,
} from "./product.schemas.js";
export type {
  ProductCatalogQuery,
  ProductCommercialUpdateInput,
  ProductCreateInput,
  ProductStatusUpdateInput,
  ProductStockUpdateInput,
  ProductUpdateInput,
} from "./product.schemas.js";
export {
  getAccommodationById,
  getPublicAccommodationBySlug,
  listAccommodationsForAdmin,
  listAccommodationsForProduct,
  listPublicAccommodations,
  updateAccommodationStatusForAdmin,
  upsertAccommodationForAdmin,
} from "./accommodation.service.js";
export type {
  AccommodationRecord,
  PublicAccommodationRecord,
} from "./accommodation.service.js";
export {
  accommodationBookingChannelSchema,
  accommodationStatusSchema,
  accommodationUpsertSchema,
} from "./accommodation.schemas.js";
export type { AccommodationUpsertInput } from "./accommodation.schemas.js";
export {
  getPublicTourismPackBySlug,
  getTourismPackById,
  listPublicTourismPacks,
  listTourismPacksForAdmin,
  upsertTourismPackForAdmin,
} from "./tourism-pack.service.js";
export type {
  PublicTourismPackRecord,
  TourismPackRecord,
} from "./tourism-pack.service.js";
export {
  tourismPackStatusSchema,
  tourismPackUpsertSchema,
} from "./tourism-pack.schemas.js";
export type { TourismPackUpsertInput } from "./tourism-pack.schemas.js";
export {
  getActiveCouponByCode,
  listCouponsForAdmin,
  previewCoupon,
  upsertCouponForAdmin,
} from "./coupon.service.js";
export type { CouponPreview, CouponRecord } from "./coupon.service.js";
export {
  applyCouponSchema,
  couponUpsertSchema,
} from "./coupon.schemas.js";
export type { ApplyCouponInput, CouponUpsertInput } from "./coupon.schemas.js";
export {
  getActiveAffiliateByCode,
  listAffiliateCodesForAdmin,
  trackAffiliateClick,
  upsertAffiliateCodeForAdmin,
  recordAffiliateCommissionForOrder,
  registerManualShowroomCommissionForAdmin,
  markAffiliateCommissionsPaidForAdmin,
  cancelAffiliateCommissionForAdmin,
  listAffiliateCommissionsForAdmin,
  getAffiliateProgramSummary,
  exportAffiliateCommissionsCsvForAdmin,
} from "./affiliate.service.js";
export type {
  AffiliateCodeRecord,
  AffiliateCommissionRecord,
  AffiliateProgramSummary,
} from "./affiliate.service.js";
export {
  AFFILIATE_TYPE_LABELS,
  AFFILIATE_STATUS_LABELS,
  COMMISSION_TYPE_LABELS,
  COMMISSION_STATUS_LABELS,
  DEFAULT_COMMISSION_BY_TYPE,
} from "./affiliate.constants.js";
export {
  affiliateRefSchema,
  affiliateUpsertSchema,
  manualShowroomCommissionSchema,
  markAffiliatePayoutSchema,
} from "./affiliate.schemas.js";
export type {
  AffiliateRefInput,
  AffiliateUpsertInput,
  ManualShowroomCommissionInput,
  MarkAffiliatePayoutInput,
} from "./affiliate.schemas.js";
export {
  notifyCheckout,
  notifyLogin,
  notifyPaymentConfirmed,
} from "./notifications.service.js";
export type {
  CheckoutNotificationParams,
  LoginNotificationParams,
  PaymentNotificationParams,
} from "./notifications.service.js";
export {
  checkSlaCompliance,
  computeSlaDeadline,
  getVendorSlaReports,
  initVendorOrderSla,
  recordVendorOrderReceived,
} from "./sla.service.js";
export type {
  SlaCheckResult,
  SlaNotification,
  VendorSlaReport,
} from "./sla.service.js";

export {
  getSiteSocialLinks,
  upsertSiteSocialLinksForAdmin,
} from "./site-social-links.service.js";
export type { SiteSocialLinksRecord } from "./site-social-links.service.js";
export { siteSocialLinksUpsertSchema } from "./site-social-links.schemas.js";
export type { SiteSocialLinksUpsertInput } from "./site-social-links.schemas.js";

export {
  deleteHomeHubTileForAdmin,
  listHomeHubTilesForAdmin,
  listHomeHubTilesForPublic,
  seedHomeHubTilesIfEmpty,
  upsertHomeHubTileForAdmin,
} from "./home-hub.service.js";
export type { HomeHubTileRecord } from "./home-hub.service.js";
export { DEFAULT_HOME_HUB_TILES, homeHubTileUpsertSchema } from "./home-hub.schemas.js";
export type { HomeHubTileUpsertInput } from "./home-hub.schemas.js";

export {
  addLodgingRelationEventForAdmin,
  getLodgingCrmSummary,
  getLodgingOfferContacts,
  getLodgingRelationById,
  listLodgingRelationsForAdmin,
  summarizeLodgingCrm,
  upsertLodgingOfferContacts,
  upsertLodgingRelationForAdmin,
} from "./lodging-relation.service.js";
export type {
  LodgingCrmSummary,
  LodgingOfferContactsRecord,
  LodgingRelationEventRecord,
  LodgingRelationRecord,
} from "./lodging-relation.service.js";
export {
  lodgingCollabModalitySchema,
  lodgingOfferContactsSchema,
  lodgingRelationEventSchema,
  lodgingRelationEventTypeSchema,
  lodgingRelationStatusSchema,
  lodgingRelationUpsertSchema,
  lodgingWelcomeModeSchema,
} from "./lodging-relation.schemas.js";
export type {
  LodgingOfferContactsInput,
  LodgingRelationEventInput,
  LodgingRelationUpsertInput,
} from "./lodging-relation.schemas.js";

export {
  deleteShowroomDailyStatForAdmin,
  enrichShowroomDailyStat,
  exportShowroomDailyStatsCsvForAdmin,
  getShowroomDailyStatsEnrichedForAdmin,
  listShowroomDailyStatsForAdmin,
  showroomDailyStatsToCsv,
  summarizeShowroomDailyStats,
  syncShowroomDailyStatsFromSystem,
  upsertShowroomDailyStatForAdmin,
  importShowroomDailyStatsFromSyntheticCsv,
  SHOWROOM_DAILY_CSV_COLUMNS,
} from "./showroom-daily-stat.service.js";
export type {
  ShowroomDailyStatExportRow,
  ShowroomDailyStatRecord,
  ShowroomDailyStatsSummary,
} from "./showroom-daily-stat.service.js";
export {
  showroomDailyStatSyncSchema,
  showroomDailyStatUpsertSchema,
} from "./showroom-daily-stat.schemas.js";
export type { ShowroomDailyStatUpsertInput } from "./showroom-daily-stat.schemas.js";
export {
  createShowroomFootfallEntry,
  deleteShowroomFootfallEntryForAdmin,
  exportShowroomFootfallCsvForAdmin,
  getShowroomFootfallOriginSummaryForAdmin,
  listShowroomFootfallEntriesForAdmin,
  summarizeShowroomFootfallOrigins,
  showroomFootfallToCsv,
} from "./showroom-footfall.service.js";
export type {
  ShowroomFootfallOriginSummary,
  ShowroomFootfallRecord,
} from "./showroom-footfall.service.js";
export {
  showroomFootfallCreateSchema,
  showroomFootfallListSchema,
  SHOWROOM_DISCOVERY_CHANNEL_LABELS,
  SHOWROOM_DISCOVERY_CHANNELS,
  SHOWROOM_FOOTFALL_TYPE_LABELS,
  SHOWROOM_FOOTFALL_TYPES,
  SHOWROOM_ORIGIN_GROUP_LABELS,
  SHOWROOM_ORIGIN_GROUPS,
} from "./showroom-footfall.schemas.js";
export type {
  ShowroomDiscoveryChannel,
  ShowroomFootfallCreateInput,
  ShowroomFootfallType,
  ShowroomOriginGroup,
} from "./showroom-footfall.schemas.js";
export {
  addStampToCard,
  createStampCardForAdmin,
  findStampCardsByQuery,
  getShowroomLoyaltySummary,
  joinShowroomClub,
  listClubMembersForAdmin,
  listRecentScratchPlays,
  listReferralsForAdmin,
  listStampCardsForAdmin,
  markReferralRewarded,
  registerReferral,
  registerScratchPlay,
  redeemStampCard,
  updateLoyaltyMonthSettings,
  SHOWROOM_SCRATCH_PRIZE_META,
} from "./showroom-loyalty.service.js";
export type {
  ShowroomClubMemberRecord,
  ShowroomLoyaltySummary,
  ShowroomReferralRecord,
  ShowroomScratchPlayRecord,
  ShowroomStampCardRecord,
} from "./showroom-loyalty.service.js";
export {
  clubJoinSchema,
  loyaltyMonthSettingsSchema,
  referralCreateSchema,
  scratchPlaySchema,
  SHOWROOM_CLUB_CHANNEL_LABELS,
  SHOWROOM_CLUB_CHANNELS,
  SHOWROOM_SCRATCH_PRIZES,
  SHOWROOM_STAMP_REWARDS,
  stampAddSchema,
  stampCardCreateSchema,
  stampRedeemSchema,
} from "./showroom-loyalty.schemas.js";
export type {
  ClubJoinInput,
  ReferralCreateInput,
  ScratchPlayInput,
  ShowroomScratchPrize,
  StampCardCreateInput,
} from "./showroom-loyalty.schemas.js";
