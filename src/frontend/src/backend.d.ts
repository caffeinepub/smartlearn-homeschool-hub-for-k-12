import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PreMadeLesson {
    lessonId: LessonId;
    title: string;
    content: string;
    subject: Subject;
    gradeLevel: GradeLevel;
}
export interface PremiumInfo {
    cancellationPolicy: string;
    benefits: Array<string>;
    price: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface SubjectSection {
    icon: string;
    name: string;
}
export interface ReportCard {
    issueDate: Time;
    overallAverage: number;
    studentId: StudentId;
    subjects: Array<SubjectGrades>;
    validUntil: Time;
    reportCardId: ReportCardId;
}
export interface NavigationInstructions {
    skipButton: string;
    progressIndicator: string;
    nextButton: string;
}
export type GradeLevel = bigint;
export interface HeroSection {
    title: string;
    tagline: string;
    image: string;
}
export interface CallToAction {
    premiumInfo: PremiumInfo;
    message: string;
}
export interface FeatureSection {
    icon: string;
    name: string;
    description: string;
}
export interface SubjectOverview {
    icon: string;
    name: string;
    description: string;
}
export interface LessonPlan {
    lessonId: LessonId;
    title: string;
    content: string;
    assignedTo: Array<StudentId>;
    subject: Subject;
    gradeLevel: GradeLevel;
    fromLibrary: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PremiumUpgradeSection {
    title: string;
    cancellationPolicy: string;
    description: string;
    benefits: Array<string>;
    price: string;
}
export type AssignmentId = bigint;
export interface Assignment {
    lessonId: LessonId;
    title: string;
    studentId: StudentId;
    assignedBy: TeacherId;
    completed: boolean;
    dueDate: Time;
    description: string;
    grade?: bigint;
    assignmentId: AssignmentId;
    submission?: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Subject {
    name: string;
    subjectId: bigint;
}
export type LessonId = bigint;
export interface OnboardingGuide {
    coreFeatures: Array<CoreFeature>;
    mainTitle: string;
    navigationInstructions: NavigationInstructions;
    introText: string;
    subjectsOverview: Array<SubjectOverview>;
    premiumUpgrade: PremiumUpgradeSection;
}
export type PublicationStatus = {
    __kind__: "published";
    published: {
        publicationTime: Time;
    };
} | {
    __kind__: "unpublished";
    unpublished: {
        reason: string;
    };
};
export type StudentId = Principal;
export type TeacherId = Principal;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SubjectGrades {
    grades: Array<bigint>;
    subject: Subject;
    average: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface CoreFeature {
    icon: string;
    name: string;
    description: string;
}
export interface AppMarketListing {
    title: string;
    thumbnail: string;
    tagline: string;
    preview: AppStorePreview;
    tags: Array<string>;
    showcaseVisuals: Array<string>;
    description: string;
}
export type ReportCardId = bigint;
export interface AppStorePreview {
    featuresSection: Array<FeatureSection>;
    heroSection: HeroSection;
    callToAction: CallToAction;
    subjectsSection: Array<SubjectSection>;
}
export interface UserProfile {
    name: string;
    role: UserRole;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignLessonToStudent(assignmentTitle: string, lessonId: LessonId, description: string, dueDate: Time, studentId: StudentId): Promise<AssignmentId>;
    cancelPremiumSubscription(): Promise<string>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCustomLesson(title: string, subject: Subject, gradeLevel: GradeLevel, content: string): Promise<LessonId>;
    createLessonFromLibrary(libraryLessonId: LessonId): Promise<LessonId>;
    generateReportCard(studentId: StudentId): Promise<ReportCardId>;
    getAllReportCardsForStudent(studentId: StudentId): Promise<Array<ReportCard>>;
    getAppMarketListing(): Promise<AppMarketListing>;
    getAppStorePreview(): Promise<AppStorePreview>;
    getAssignmentsBySubject(studentId: StudentId, subjectId: bigint): Promise<Array<Assignment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGradeAveragesBySubject(studentId: StudentId, subjectId: bigint): Promise<bigint>;
    getLessonAssignmentDetails(assignmentId: AssignmentId): Promise<[string, string, string, Time] | null>;
    getLessonAverageBySubject(studentId: StudentId, subjectId: bigint): Promise<bigint>;
    getLessonContent(lessonId: LessonId): Promise<string>;
    getOnboardingGuide(): Promise<OnboardingGuide>;
    getPreMadeLessons(): Promise<Array<PreMadeLesson>>;
    getPremiumAccessStatus(user: Principal): Promise<boolean>;
    getPublicationStatus(): Promise<PublicationStatus>;
    getReportCard(reportCardId: ReportCardId): Promise<ReportCard>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getStudentAssignments(studentId: StudentId): Promise<Array<Assignment>>;
    getStudentReportCards(studentId: StudentId): Promise<Array<ReportCard>>;
    getSubjects(): Promise<Array<Subject>>;
    getUnpublishReason(): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    gradeAssignment(assignmentId: AssignmentId, grade: bigint): Promise<void>;
    grantPremiumAccess(user: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isPublished(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isSubscriptionCancelled(user: Principal): Promise<boolean>;
    listAllLessonPlans(): Promise<Array<LessonPlan>>;
    publishApp(): Promise<void>;
    purchasePremiumAccess(): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitAssignment(assignmentId: AssignmentId, submission: string): Promise<void>;
    submitAssignmentWithGrade(assignmentId: AssignmentId, submission: string, grade: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unpublishApp(reason: string): Promise<void>;
    viewLessonsByGrade(gradeLevel: GradeLevel): Promise<Array<LessonPlan>>;
}
