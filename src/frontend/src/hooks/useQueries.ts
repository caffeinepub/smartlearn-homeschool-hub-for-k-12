import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, LessonPlan, Assignment, Subject, PreMadeLesson, ReportCard, ShoppingItem, StripeConfiguration, AppStorePreview, PublicationStatus } from '../backend';
import { UserRole } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

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
    staleTime: 30000,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicationStatus'] });
      toast.success('App published successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish app: ${error.message}`);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicationStatus'] });
      toast.success('App unpublished successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unpublish app: ${error.message}`);
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
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

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
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
    mutationFn: async (params: { title: string; subject: Subject; gradeLevel: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomLesson(params.title, params.subject, params.gradeLevel, params.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonPlans'] });
      toast.success('Custom lesson created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create lesson: ${error.message}`);
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
      toast.success('Lesson added from library successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add lesson from library: ${error.message}`);
    },
  });
}

export function useAssignLessonToStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      assignmentTitle: string;
      lessonId: bigint;
      description: string;
      dueDate: bigint;
      studentId: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignLessonToStudent(
        params.assignmentTitle,
        params.lessonId,
        params.description,
        params.dueDate,
        params.studentId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Lesson assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign lesson: ${error.message}`);
    },
  });
}

export function useGetStudentAssignments(studentId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Assignment[]>({
    queryKey: ['assignments', studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentAssignments(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useSubmitAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assignmentId: bigint; submission: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAssignment(params.assignmentId, params.submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit assignment: ${error.message}`);
    },
  });
}

export function useGradeAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assignmentId: bigint; grade: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.gradeAssignment(params.assignmentId, params.grade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['gradeAverages'] });
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
      toast.success('Assignment graded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to grade assignment: ${error.message}`);
    },
  });
}

export function useGetGradeAveragesBySubject(studentId: Principal | null, subjectId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['gradeAverages', studentId?.toString(), subjectId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId || subjectId === null) return BigInt(0);
      return actor.getGradeAveragesBySubject(studentId, subjectId);
    },
    enabled: !!actor && !actorFetching && !!studentId && subjectId !== null,
  });
}

// Premium subscription hooks
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
      toast.success('Stripe configured successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to configure Stripe: ${error.message}`);
    },
  });
}

export function useGetPremiumAccessStatus(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['premiumAccess', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
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
      if (!actor || !user) return false;
      return actor.isSubscriptionCancelled(user);
    },
    enabled: !!actor && !actorFetching && !!user,
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
      queryClient.invalidateQueries({ queryKey: ['premiumAccess'] });
      toast.success('Subscription cancelled successfully');
      return message;
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`);
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(params.items, params.successUrl, params.cancelUrl);
      return JSON.parse(result) as { id: string; url: string };
    },
    onError: (error: Error) => {
      toast.error(`Failed to create checkout session: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Failed to generate report card: ${error.message}`);
    },
  });
}

export function useGetStudentReportCards(studentId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards', studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentReportCards(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
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
  });
}
