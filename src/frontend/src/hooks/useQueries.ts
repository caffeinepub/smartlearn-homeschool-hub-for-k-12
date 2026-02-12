import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, LessonPlan, Assignment, Subject, PreMadeLesson, ReportCard, ShoppingItem, StripeConfiguration, AppStorePreview, PublicationStatus, LessonPlanRequest, LessonPlanDraft } from '../backend';
import { UserRole } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { classifyAuthorizationError } from '../utils/authorizationErrors';
import { normalizeErrorMessage } from '../utils/userFacingErrors';

export function useGetPublicationStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicationStatus>({
    queryKey: ['publicationStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPublicationStatus();
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    staleTime: 0,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function usePublishApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishApp();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['publicationStatus'] });
      await queryClient.refetchQueries({ queryKey: ['publicationStatus'] });
      toast.success('App published successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useUnpublishApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unpublishApp(reason);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['publicationStatus'] });
      await queryClient.refetchQueries({ queryKey: ['publicationStatus'] });
      toast.success('App unpublished successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', identity?.getPrincipal().toString()] });
      toast.success('Profile saved successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGetAppStorePreview() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AppStorePreview>({
    queryKey: ['appStorePreview'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAppStorePreview();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 60000,
  });
}

export function useGetSubjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSubjects();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}

export function useGetPreMadeLessons() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PreMadeLesson[]>({
    queryKey: ['preMadeLessons'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPreMadeLessons();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useListAllLessonPlans() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LessonPlan[]>({
    queryKey: ['lessonPlans'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllLessonPlans();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateCustomLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, subject, gradeLevel, content }: { title: string; subject: Subject; gradeLevel: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomLesson(title, subject, gradeLevel, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonPlans'] });
      toast.success('Lesson created successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useCreateLessonFromLibrary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (libraryLessonId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLessonFromLibrary(libraryLessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonPlans'] });
      toast.success('Lesson added from library');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGenerateAiLessonPlanDraft() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (request: LessonPlanRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateAiLessonPlanDraft(request);
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGetStudentAssignments(studentId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Assignment[]>({
    queryKey: ['studentAssignments', studentId?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!studentId) throw new Error('Student ID not available');
      return actor.getStudentAssignments(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useAssignLessonToStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentTitle, lessonId, description, dueDate, studentId }: { assignmentTitle: string; lessonId: bigint; description: string; dueDate: bigint; studentId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignLessonToStudent(assignmentTitle, lessonId, description, dueDate, studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      toast.success('Assignment created successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useSubmitAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, submission }: { assignmentId: bigint; submission: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAssignment(assignmentId, submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      toast.success('Assignment submitted successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGradeAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, grade }: { assignmentId: bigint; grade: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.gradeAssignment(assignmentId, grade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
      toast.success('Assignment graded successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGetPremiumAccessStatus(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['premiumAccess', user?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!user) throw new Error('User principal not available');
      return actor.getPremiumAccessStatus(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useIsSubscriptionCancelled(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['subscriptionCancelled', user?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!user) throw new Error('User principal not available');
      return actor.isSubscriptionCancelled(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useGetGradeAveragesBySubject(studentId: Principal | null, subjectId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['gradeAverages', studentId?.toString(), subjectId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!studentId) throw new Error('Student ID not available');
      return actor.getGradeAveragesBySubject(studentId, subjectId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useCancelPremiumSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelPremiumSubscription();
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionCancelled'] });
      toast.success(message);
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGenerateReportCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateReportCard(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
      toast.success('Report card generated successfully');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}

export function useGetStudentReportCards(studentId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards', studentId?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!studentId) throw new Error('Student ID not available');
      return actor.getStudentReportCards(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      toast.success('Stripe configuration saved');
    },
    onError: (error: unknown) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const authResult = classifyAuthorizationError(errorObj);
      toast.error(normalizeErrorMessage(authResult.message));
    },
  });
}
