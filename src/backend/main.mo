import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type UserRole = AccessControl.UserRole;
  type GradeLevel = Nat; // 0 = Pre-K, 1-12 = respective grades
  type LessonId = Nat;
  type StudentId = Principal;
  type TeacherId = Principal;
  type AssignmentId = Nat;
  type ReportCardId = Nat;

  type PublicationStatus = {
    #unpublished : { reason : Text };
    #published : { publicationTime : Time.Time };
  };

  var publicationStatus : PublicationStatus = #published {
    publicationTime = Time.now();
  };

  public shared ({ caller }) func publishApp() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can publish the app");
    };
    publicationStatus := #published { publicationTime = Time.now() };
  };

  public shared ({ caller }) func unpublishApp(reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unpublish the app");
    };
    publicationStatus := #unpublished { reason };
  };

  public query func getPublicationStatus() : async PublicationStatus {
    publicationStatus;
  };

  public query func isPublished() : async Bool {
    switch (publicationStatus) {
      case (#published _) { true };
      case (#unpublished _) { false };
    };
  };

  public query func getUnpublishReason() : async ?Text {
    switch (publicationStatus) {
      case (#published _) { null };
      case (#unpublished { reason }) { ?reason };
    };
  };

  func checkPublished() {
    switch (publicationStatus) {
      case (#unpublished { reason }) {
        Runtime.trap("App is currently unpublished: " # reason);
      };
      case (#published _) {};
    };
  };

  public type UserProfile = {
    name : Text;
    role : UserRole;
  };

  public type OnboardingGuide = {
    mainTitle : Text;
    introText : Text;
    coreFeatures : [CoreFeature];
    subjectsOverview : [SubjectOverview];
    premiumUpgrade : PremiumUpgradeSection;
    navigationInstructions : NavigationInstructions;
  };

  public type CoreFeature = {
    name : Text;
    description : Text;
    icon : Text;
  };

  public type SubjectOverview = {
    name : Text;
    description : Text;
    icon : Text;
  };

  public type PremiumUpgradeSection = {
    title : Text;
    description : Text;
    price : Text;
    benefits : [Text];
    cancellationPolicy : Text;
  };

  public type NavigationInstructions = {
    nextButton : Text;
    skipButton : Text;
    progressIndicator : Text;
  };

  public type Subject = {
    subjectId : Nat;
    name : Text;
  };

  public type PreMadeLesson = {
    lessonId : LessonId;
    title : Text;
    subject : Subject;
    gradeLevel : GradeLevel;
    content : Text;
  };

  public type LessonPlan = {
    lessonId : LessonId;
    title : Text;
    subject : Subject;
    gradeLevel : GradeLevel;
    content : Text;
    assignedTo : [StudentId];
    fromLibrary : Bool;
  };

  public type Assignment = {
    assignmentId : AssignmentId;
    lessonId : LessonId;
    title : Text;
    description : Text;
    dueDate : Time.Time;
    assignedBy : TeacherId;
    studentId : StudentId;
    submission : ?Text;
    grade : ?Nat;
    completed : Bool;
  };

  public type GradingRecord = {
    assignmentId : AssignmentId;
    grade : Nat;
  };

  public type StudentProgress = {
    studentId : StudentId;
    assignments : [Assignment];
  };

  public type ReportCard = {
    reportCardId : ReportCardId;
    studentId : StudentId;
    subjects : [SubjectGrades];
    overallAverage : Float;
    issueDate : Time.Time;
    validUntil : Time.Time;
  };

  public type SubjectGrades = {
    subject : Subject;
    grades : [Nat];
    average : Float;
  };

  public type PremiumAccess = {
    expiration : Time.Time;
    var cancelled : Bool;
  };

  public type AppStorePreview = {
    heroSection : HeroSection;
    featuresSection : [FeatureSection];
    subjectsSection : [SubjectSection];
    callToAction : CallToAction;
  };

  public type HeroSection = {
    title : Text;
    tagline : Text;
    image : Text;
  };

  public type FeatureSection = {
    name : Text;
    description : Text;
    icon : Text;
  };

  public type SubjectSection = {
    name : Text;
    icon : Text;
  };

  public type CallToAction = {
    message : Text;
    premiumInfo : PremiumInfo;
  };

  public type PremiumInfo = {
    price : Text;
    benefits : [Text];
    cancellationPolicy : Text;
  };

  public type AppMarketListing = {
    title : Text;
    tagline : Text;
    description : Text;
    thumbnail : Text;
    showcaseVisuals : [Text];
    tags : [Text];
    preview : AppStorePreview;
  };

  module LessonPlan {
    public func compare(a : LessonPlan, b : LessonPlan) : Order.Order {
      if (a.lessonId < b.lessonId) { #less } else if (a.lessonId > b.lessonId) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  module Assignment {
    public func compare(a : Assignment, b : Assignment) : Order.Order {
      if (a.assignmentId < b.assignmentId) { #less } else if (a.assignmentId > b.assignmentId) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  module GradingRecord {
    public func compare(a : GradingRecord, b : GradingRecord) : Order.Order {
      if (a.assignmentId < b.assignmentId) { #less } else if (a.assignmentId > b.assignmentId) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  module StudentProgress {
    public func compare(a : StudentProgress, b : StudentProgress) : Order.Order {
      if (a.studentId.toText() < b.studentId.toText()) { #less } else if (a.studentId.toText() > b.studentId.toText()) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  let lessonPlans = Map.empty<LessonId, LessonPlan>();
  let preMadeLessons = Map.empty<LessonId, PreMadeLesson>();
  let assignments = Map.empty<AssignmentId, Assignment>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let premiumAccess = Map.empty<Principal, PremiumAccess>();
  let reportCards = Map.empty<Nat, ReportCard>();

  var nextLessonId = 1;
  var nextAssignmentId = 1;
  var nextReportCardId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Updated to ~9 weeks in nanoseconds
  let premiumPriceCents = 500;
  let accessDurationNanos = 9 * 7 * 24 * 60 * 60 * 1_000_000_000;

  public shared ({ caller }) func purchasePremiumAccess() : async Text {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase premium access");
    };

    let items = [
      {
        currency = "usd";
        productName = "Premium Report Card Access";
        productDescription = "9 weeks access to report card features";
        priceInCents = premiumPriceCents;
        quantity = 1;
      },
    ];

    let successUrl = "https://your-frontend-url/success?principal=" # caller.toText();
    let cancelUrl = "https://your-frontend-url/cancel";

    await createCheckoutSession(items, successUrl, cancelUrl);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func grantPremiumAccess(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant premium access");
    };
    addPremiumAccess(user);
  };

  func addPremiumAccess(user : Principal) {
    let expiration = Time.now() + accessDurationNanos;
    let access : PremiumAccess = {
      expiration;
      var cancelled = false;
    };
    premiumAccess.add(user, access);
  };

  public shared ({ caller }) func cancelPremiumSubscription() : async Text {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel subscriptions");
    };

    switch (premiumAccess.get(caller)) {
      case (null) {
        Runtime.trap("No active premium subscription found");
      };
      case (?access) {
        if (Time.now() > access.expiration) {
          Runtime.trap("Subscription has already expired");
        };

        if (access.cancelled) {
          Runtime.trap("Subscription is already cancelled. No further action needed.");
        };

        access.cancelled := true;
        "Your premium access has been cancelled. You will retain access until " # access.expiration.toText();
      };
    };
  };

  public query ({ caller }) func isSubscriptionCancelled(user : Principal) : async Bool {
    checkPublished();

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own subscription status");
    };

    switch (premiumAccess.get(user)) {
      case (null) { false };
      case (?access) { access.cancelled };
    };
  };

  public query ({ caller }) func getPremiumAccessStatus(user : Principal) : async Bool {
    checkPublished();

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own premium status");
    };

    switch (premiumAccess.get(user)) {
      case (null) { false };
      case (?access) {
        Time.now() < access.expiration;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkPublished();

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query func getSubjects() : async [Subject] {
    checkPublished();

    [
      { subjectId = 1; name = "History" },
      { subjectId = 2; name = "Math" },
      { subjectId = 3; name = "Language Arts/Reading" },
      { subjectId = 4; name = "Science" },
      { subjectId = 5; name = "Social Studies" },
    ];
  };

  public query func getPreMadeLessons() : async [PreMadeLesson] {
    checkPublished();

    preMadeLessons.values().toArray();
  };

  public shared ({ caller }) func createCustomLesson(title : Text, subject : Subject, gradeLevel : GradeLevel, content : Text) : async LessonId {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only teachers/admins can create lesson plans");
    };

    let lessonId = nextLessonId;
    nextLessonId += 1;

    let lessonPlan : LessonPlan = {
      lessonId;
      title;
      subject;
      gradeLevel;
      content;
      assignedTo = [];
      fromLibrary = false;
    };

    lessonPlans.add(lessonId, lessonPlan);
    lessonId;
  };

  public shared ({ caller }) func createLessonFromLibrary(libraryLessonId : LessonId) : async LessonId {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only teachers/admins can create lesson plans from library");
    };

    switch (preMadeLessons.get(libraryLessonId)) {
      case (null) { Runtime.trap("Library lesson not found") };
      case (?libraryLesson) {
        let lessonId = nextLessonId;
        nextLessonId += 1;

        let lessonPlan : LessonPlan = {
          lessonId;
          title = libraryLesson.title;
          subject = libraryLesson.subject;
          gradeLevel = libraryLesson.gradeLevel;
          content = libraryLesson.content;
          assignedTo = [];
          fromLibrary = true;
        };

        lessonPlans.add(lessonId, lessonPlan);
        lessonId;
      };
    };
  };

  public query ({ caller }) func listAllLessonPlans() : async [LessonPlan] {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lesson plans");
    };
    lessonPlans.values().toArray().sort();
  };

  public query ({ caller }) func viewLessonsByGrade(gradeLevel : GradeLevel) : async [LessonPlan] {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lessons");
    };
    lessonPlans.values().toArray().filter(
      func(lp) {
        lp.gradeLevel == gradeLevel;
      }
    ).sort();
  };

  public query ({ caller }) func getLessonContent(lessonId : LessonId) : async Text {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lesson content");
    };
    switch (lessonPlans.get(lessonId)) {
      case (null) { Runtime.trap("Lesson not found") };
      case (?lessonPlan) { lessonPlan.content };
    };
  };

  public shared ({ caller }) func assignLessonToStudent(assignmentTitle : Text, lessonId : LessonId, description : Text, dueDate : Time.Time, studentId : StudentId) : async AssignmentId {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only teachers/admins can assign lessons");
    };

    let assignmentId = nextAssignmentId;
    nextAssignmentId += 1;

    switch (lessonPlans.get(lessonId)) {
      case (null) { Runtime.trap("Lesson not found") };
      case (?_) {
        let assignment : Assignment = {
          assignmentId;
          lessonId;
          title = assignmentTitle;
          description;
          dueDate;
          assignedBy = caller;
          studentId = studentId;
          submission = null;
          grade = null;
          completed = false;
        };

        assignments.add(assignmentId, assignment);
        assignmentId;
      };
    };
  };

  public query ({ caller }) func getLessonAssignmentDetails(assignmentId : AssignmentId) : async ?(Text, Text, Text, Time.Time) {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignment details");
    };

    switch (assignments.get(assignmentId)) {
      case (null) { null };
      case (?assignment) {
        if (caller != assignment.studentId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own assignments");
        };

        switch (lessonPlans.get(assignment.lessonId)) {
          case (null) { null };
          case (?lesson) {
            ?(lesson.title, lesson.content, assignment.description, assignment.dueDate);
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitAssignment(assignmentId : AssignmentId, submission : Text) : async () {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit assignments");
    };

    switch (assignments.get(assignmentId)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        if (caller != assignment.studentId) {
          Runtime.trap("Unauthorized: Only the assigned student can submit this assignment");
        };

        let updatedAssignment : Assignment = {
          assignment with
          submission = ?submission;
          completed = true;
        };

        assignments.add(assignmentId, updatedAssignment);
      };
    };
  };

  public shared ({ caller }) func submitAssignmentWithGrade(assignmentId : AssignmentId, submission : Text, grade : Nat) : async () {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only teachers/admins can submit assignments with grades");
    };

    switch (assignments.get(assignmentId)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        let updatedAssignment : Assignment = {
          assignment with
          submission = ?submission;
          grade = ?grade;
          completed = true;
        };

        assignments.add(assignmentId, updatedAssignment);
      };
    };
  };

  public shared ({ caller }) func gradeAssignment(assignmentId : AssignmentId, grade : Nat) : async () {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only teachers/admins can grade assignments");
    };

    switch (assignments.get(assignmentId)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        let updatedAssignment : Assignment = {
          assignment with grade = ?grade;
        };
        assignments.add(assignmentId, updatedAssignment);
      };
    };
  };

  public query ({ caller }) func getStudentAssignments(studentId : StudentId) : async [Assignment] {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignments");
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own assignments");
    };

    assignments.values().toArray().filter(
      func(a) {
        a.studentId == studentId;
      }
    ).sort();
  };

  public query ({ caller }) func getAssignmentsBySubject(studentId : StudentId, subjectId : Nat) : async [Assignment] {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignments");
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own assignments");
    };

    let filteredAssignments = List.empty<Assignment>();

    for (assignment in assignments.values()) {
      if (assignment.studentId == studentId) {
        switch (lessonPlans.get(assignment.lessonId)) {
          case (null) {};
          case (?lesson) {
            if (lesson.subject.subjectId == subjectId) {
              filteredAssignments.add(assignment);
            };
          };
        };
      };
    };

    filteredAssignments.toArray().sort();
  };

  func calculateSubjectAverage(studentId : StudentId, subjectId : Nat) : Nat {
    let filteredGrades = List.empty<Nat>();

    for (assignment in assignments.values()) {
      if (assignment.studentId == studentId) {
        switch (lessonPlans.get(assignment.lessonId)) {
          case (null) {};
          case (?lesson) {
            if (lesson.subject.subjectId == subjectId) {
              switch (assignment.grade) {
                case (null) {};
                case (?grade) {
                  filteredGrades.add(grade);
                };
              };
            };
          };
        };
      };
    };

    let gradesArray = filteredGrades.toArray();

    if (gradesArray.size() == 0) { return 0 };
    let sum = gradesArray.foldLeft(0, func(accum, grade) { accum + grade });
    sum / gradesArray.size();
  };

  public query ({ caller }) func getGradeAveragesBySubject(studentId : StudentId, subjectId : Nat) : async Nat {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view grade averages");
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own grades");
    };

    calculateSubjectAverage(studentId, subjectId);
  };

  public query ({ caller }) func getLessonAverageBySubject(studentId : StudentId, subjectId : Nat) : async Nat {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lesson averages");
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own averages");
    };

    calculateSubjectAverage(studentId, subjectId);
  };

  func calculateSubjectGrades(studentId : StudentId, subjectId : Nat) : SubjectGrades {
    let grades = List.empty<Nat>();

    for (assignment in assignments.values()) {
      if (assignment.studentId == studentId) {
        switch (lessonPlans.get(assignment.lessonId)) {
          case (null) {};
          case (?lesson) {
            if (lesson.subject.subjectId == subjectId) {
              switch (assignment.grade) {
                case (null) {};
                case (?grade) {
                  grades.add(grade);
                };
              };
            };
          };
        };
      };
    };

    let gradesArray = grades.toArray();

    let average : Float = if (gradesArray.size() == 0) {
      0;
    } else {
      let sum = gradesArray.foldLeft(0, func(accum, grade) { accum + grade });
      let avg : Float = sum.toFloat() / gradesArray.size().toInt().toFloat();
      avg;
    };

    {
      subject = {
        subjectId;
        name =
          switch (subjectId) {
            case (1) { "History" };
            case (2) { "Math" };
            case (3) { "Language Arts/Reading" };
            case (4) { "Science" };
            case (5) { "Social Studies" };
            case (_) { "Unknown" };
          };
      };
      grades = gradesArray;
      average;
    };
  };

  func calculateOverallAverage(studentId : StudentId) : Float {
    var totalSum : Nat = 0;
    var count : Nat = 0;

    for (assignment in assignments.values()) {
      if (assignment.studentId == studentId) {
        switch (assignment.grade) {
          case (null) {};
          case (?grade) {
            totalSum += grade;
            count += 1;
          };
        };
      };
    };

    if (count == 0) { return 0 };
    totalSum.toFloat() / count.toInt().toFloat();
  };

  public shared ({ caller }) func generateReportCard(studentId : StudentId) : async ReportCardId {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate report cards");
    };

    switch (premiumAccess.get(caller)) {
      case (null) {
        Runtime.trap("You do not have premium access to generate report cards. Please subscribe to access this feature")
      };
      case (?access) {
        if (Time.now() > access.expiration) {
          Runtime.trap("Your premium access has expired. Please renew to access this feature");
        };
      };
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only generate report cards for yourself or your students");
    };

    let subjects = await getSubjects();
    let subjectGrades = subjects.map(func(subject) { calculateSubjectGrades(studentId, subject.subjectId) });

    let overallAverage = calculateOverallAverage(studentId);

    let reportCard : ReportCard = {
      reportCardId = nextReportCardId;
      studentId;
      subjects = subjectGrades;
      overallAverage;
      issueDate = Time.now();
      validUntil = Time.now() + accessDurationNanos;
    };

    reportCards.add(nextReportCardId, reportCard);
    nextReportCardId += 1;
    reportCard.reportCardId;
  };

  public query ({ caller }) func getReportCard(reportCardId : ReportCardId) : async ReportCard {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view report cards");
    };

    switch (reportCards.get(reportCardId)) {
      case (null) { Runtime.trap("Report card not found") };
      case (?reportCard) {
        if (caller != reportCard.studentId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own report cards");
        };

        if (Time.now() > reportCard.validUntil) {
          Runtime.trap("This report card has expired");
        };

        reportCard;
      };
    };
  };

  public query ({ caller }) func getAllReportCardsForStudent(studentId : StudentId) : async [ReportCard] {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view report cards");
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own report cards");
    };

    reportCards.values().toArray().filter(
      func(card) {
        card.studentId == studentId;
      }
    );
  };

  public query ({ caller }) func getStudentReportCards(studentId : StudentId) : async [ReportCard] {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view report cards");
    };

    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own report cards");
    };

    reportCards.values().toArray().filter(
      func(card) {
        card.studentId == studentId;
      }
    );
  };

  public query func getAppStorePreview() : async AppStorePreview {
    checkPublished();

    {
      heroSection = {
        title = "SmartLearn: Homeschool Hub for K–12";
        tagline = "Empowering parents and teachers with free lessons, progress tracking, and premium report cards.";
        image = "generated/classroom-hero.dim_800x600.png";
      };
      featuresSection = [
        {
          name = "Learning";
          description = "Create and explore lesson plans across 5 core subjects for grades K–12.";
          icon = "generated/lesson-plan-icon.dim_64x64.png";
        },
        {
          name = "Progress Tracking";
          description = "Visual dashboards to track student progress and achievement.";
          icon = "generated/progress-icon.dim_64x64.png";
        },
        {
          name = "Grading System";
          description = "Manage grades and assessments with automatic calculations.";
          icon = "generated/grading-icon.dim_64x64.png";
        },
        {
          name = "Achievements";
          description = "Celebrate milestones with achievement tracking tools.";
          icon = "generated/graduation-cap-icon.dim_64x64.png";
        },
      ];
      subjectsSection = [
        {
          name = "History";
          icon = "generated/history-icon.dim_64x64.png";
        },
        {
          name = "Math";
          icon = "generated/math-icon.dim_64x64.png";
        },
        {
          name = "Language Arts";
          icon = "generated/language-arts-icon.dim_64x64.png";
        },
        {
          name = "Science";
          icon = "generated/science-icon.dim_64x64.png";
        },
        {
          name = "Social Studies";
          icon = "generated/social-studies-icon.dim_64x64.png";
        },
      ];
      callToAction = {
        message = "Start your homeschooling journey free! Access all learning tools and progress tracking at no cost. Unlock premium report card features for just $5 every 9 weeks.";
        premiumInfo = {
          price = "$5 every 9 weeks";
          benefits = [
            "Unlimited report card access",
            "Printable and shareable reports",
            "Automated grade tracking",
          ];
          cancellationPolicy = "No hidden fees. Cancel anytime and retain access until your current subscription period ends.";
        };
      };
    };
  };

  public query func getAppMarketListing() : async AppMarketListing {
    checkPublished();

    {
      title = "SmartLearn: Homeschool Hub for K–12";
      tagline = "Empowering parents and teachers with free lessons, progress tracking, and premium report cards.";
      description = "SmartLearn makes homeschooling interactive and effortless. Explore pre-made lessons across the five core subjects—History, Math, Language Arts, Science, and Social Studies. Track student progress with clear visuals and automatic grading tools. All learning content is free to use, while official report cards are available through an affordable $5 premium plan every three months, with easy cancellation and no hidden fees. Start guiding your learner's journey with confidence today!";
      thumbnail = "generated/classroom-hero.dim_800x600.png";
      showcaseVisuals = [
        "generated/history-icon.dim_64x64.png",
        "generated/math-icon.dim_64x64.png",
        "generated/language-arts-icon.dim_64x64.png",
        "generated/science-icon.dim_64x64.png",
        "generated/social-studies-icon.dim_64x64.png",
        "generated/progress-icon.dim_64x64.png",
        "generated/graduation-cap-icon.dim_64x64.png",
        "generated/lesson-plan-icon.dim_64x64.png",
        "generated/grading-icon.dim_64x64.png",
      ];
      tags = [
        "education",
        "homeschooling",
        "grading",
        "progress-tracking",
        "report-cards",
        "K12",
      ];
      preview = {
        heroSection = {
          title = "SmartLearn: Homeschool Hub for K–12";
          tagline = "Empowering parents and teachers with free lessons, progress tracking, and premium report cards.";
          image = "generated/classroom-hero.dim_800x600.png";
        };
        featuresSection = [
          {
            name = "Learning";
            description = "Create and explore lesson plans across 5 core subjects for grades K–12.";
            icon = "generated/lesson-plan-icon.dim_64x64.png";
          },
          {
            name = "Progress Tracking";
            description = "Visual dashboards to track student progress and achievement.";
            icon = "generated/progress-icon.dim_64x64.png";
          },
          {
            name = "Grading System";
            description = "Manage grades and assessments with automatic calculations.";
            icon = "generated/grading-icon.dim_64x64.png";
          },
          {
            name = "Achievements";
            description = "Celebrate milestones with achievement tracking tools.";
            icon = "generated/graduation-cap-icon.dim_64x64.png";
          },
        ];
        subjectsSection = [
          {
            name = "History";
            icon = "generated/history-icon.dim_64x64.png";
          },
          {
            name = "Math";
            icon = "generated/math-icon.dim_64x64.png";
          },
          {
            name = "Language Arts";
            icon = "generated/language-arts-icon.dim_64x64.png";
          },
          {
            name = "Science";
            icon = "generated/science-icon.dim_64x64.png";
          },
          {
            name = "Social Studies";
            icon = "generated/social-studies-icon.dim_64x64.png";
          },
        ];
        callToAction = {
          message = "Start your homeschooling journey free! Access all learning tools and progress tracking at no cost. Unlock premium report card features for just $5 every 9 weeks.";
          premiumInfo = {
            price = "$5 every 9 weeks";
            benefits = [
              "Unlimited report card access",
              "Printable and shareable reports",
              "Automated grade tracking",
            ];
            cancellationPolicy = "No hidden fees. Cancel anytime and retain access until your current subscription period ends.";
          };
        };
      };
    };
  };

  public query ({ caller }) func getOnboardingGuide() : async OnboardingGuide {
    checkPublished();

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access the onboarding guide");
    };

    {
      mainTitle = "Welcome to SmartLearn: Homeschool Hub for K–12";
      introText = "Your all-in-one homeschool management platform for grades K-12. Create lesson plans, track progress, and manage grades effortlessly. Explore 5 core subjects: History, Math, Language Arts, Science, and Social Studies. All core features are free, with report cards available for just $5 every three months.";
      coreFeatures = [
        {
          name = "Lesson Planning";
          description = "Create and customize lessons across core subjects for K–12.";
          icon = "generated/lesson-plan-icon.dim_64x64.png";
        },
        {
          name = "Progress Tracking";
          description = "Visual dashboards to monitor student progress and achievements.";
          icon = "generated/progress-icon.dim_64x64.png";
        },
        {
          name = "Grading System";
          description = "Easy grade input and automatic calculations for all assignments.";
          icon = "generated/grading-icon.dim_64x64.png";
        },
        {
          name = "Report Cards";
          description = "Optional premium feature for comprehensive student reports.";
          icon = "generated/graduation-cap-icon.dim_64x64.png";
        },
      ];
      subjectsOverview = [
        {
          name = "History";
          description = "Learn about past events, cultures, and civilizations.";
          icon = "generated/history-icon.dim_64x64.png";
        },
        {
          name = "Math";
          description = "Numbers, patterns, and equations for problem-solving skills.";
          icon = "generated/math-icon.dim_64x64.png";
        },
        {
          name = "Language Arts";
          description = "Expand reading, writing, and communication abilities.";
          icon = "generated/language-arts-icon.dim_64x64.png";
        },
        {
          name = "Science";
          description = "Discover the natural world through exploration and experimentation.";
          icon = "generated/science-icon.dim_64x64.png";
        },
        {
          name = "Social Studies";
          description = "Understand societal structures and cultural perspectives.";
          icon = "generated/social-studies-icon.dim_64x64.png";
        },
      ];
      premiumUpgrade = {
        title = "Upgrade to Premium: Report Card Access";
        description = "Gain access to comprehensive student report cards. Premium features are available for just $5 every 9 weeks. Create and manage multiple report cards with detailed analytics.";
        price = "$5 every 9 weeks";
        benefits = [
          "Unlimited report card access",
          "Printable and shareable reports",
          "Automated grade tracking",
        ];
        cancellationPolicy = "No hidden fees. Cancel anytime and retain access until your current subscription period ends.";
      };
      navigationInstructions = {
        nextButton = "Next";
        skipButton = "Skip";
        progressIndicator = "Step {0} of {1}";
      };
    };
  };
};
