import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateGenerationInput = {
  fps?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  modelId: Scalars['String']['input'];
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  steps?: InputMaybe<Scalars['Int']['input']>;
  type: GenerationType;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type GenerationProgressUpdate = {
  __typename?: 'GenerationProgressUpdate';
  currentStep: Scalars['Int']['output'];
  etaSeconds?: Maybe<Scalars['Float']['output']>;
  previewUrl?: Maybe<Scalars['String']['output']>;
  progressPct: Scalars['Int']['output'];
  status: TaskStatus;
  taskId: Scalars['ID']['output'];
  totalSteps: Scalars['Int']['output'];
};

export type GenerationTask = {
  __typename?: 'GenerationTask';
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  currentStep: Scalars['Int']['output'];
  durationMs?: Maybe<Scalars['Int']['output']>;
  errorReason?: Maybe<Scalars['String']['output']>;
  finalMediaUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  modelId: Scalars['String']['output'];
  negativePrompt?: Maybe<Scalars['String']['output']>;
  previewUrl?: Maybe<Scalars['String']['output']>;
  priorityTier: Scalars['String']['output'];
  progressPct: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  status: TaskStatus;
  totalSteps: Scalars['Int']['output'];
  type: GenerationType;
  userId: Scalars['String']['output'];
};

/**
 * StudioForge — GenAI Studio & Media Generation GraphQL Schema (2026)
 * Optimized for Apollo Client 3.12+, gqlgen Go server, and real-time generation streaming.
 */
export enum GenerationType {
  ImageTextToImage = 'IMAGE_TEXT_TO_IMAGE',
  ImageToImage = 'IMAGE_TO_IMAGE',
  VideoInterpolation = 'VIDEO_INTERPOLATION',
  VideoTextToVideo = 'VIDEO_TEXT_TO_VIDEO'
}

export type Mutation = {
  __typename?: 'Mutation';
  cancelGeneration: Scalars['Boolean']['output'];
  createGeneration: GenerationTask;
  retryFailedTask: GenerationTask;
};


export type MutationCancelGenerationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateGenerationArgs = {
  input: CreateGenerationInput;
};


export type MutationRetryFailedTaskArgs = {
  taskId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  generationTask?: Maybe<GenerationTask>;
  recentTasks: Array<GenerationTask>;
  systemMetrics: WorkerMetrics;
};


export type QueryGenerationTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRecentTasksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TaskStatus>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Real-time frame-by-frame progress updates for an active generation job */
  generationProgress: GenerationProgressUpdate;
  /** Live system-level GPU cluster and queue metrics emitted every 1,500ms */
  metricsStream: WorkerMetrics;
};


export type SubscriptionGenerationProgressArgs = {
  taskId: Scalars['ID']['input'];
};

export enum TaskStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
  Queued = 'QUEUED',
  Transcoding = 'TRANSCODING'
}

export type WorkerMetrics = {
  __typename?: 'WorkerMetrics';
  activeInferring: Scalars['Int']['output'];
  averageLatencyMs: Scalars['Float']['output'];
  costEfficiencyRatio: Scalars['Float']['output'];
  queueDepthBatch: Scalars['Int']['output'];
  queueDepthVip: Scalars['Int']['output'];
  totalWorkers: Scalars['Int']['output'];
};

export type GetGenerationTaskQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGenerationTaskQuery = { __typename?: 'Query', generationTask?: { __typename?: 'GenerationTask', id: string, userId: string, prompt: string, negativePrompt?: string | null, type: GenerationType, modelId: string, status: TaskStatus, priorityTier: string, progressPct: number, currentStep: number, totalSteps: number, previewUrl?: string | null, finalMediaUrl?: string | null, durationMs?: number | null, errorReason?: string | null, createdAt: string, completedAt?: string | null } | null };

export type GetRecentTasksQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TaskStatus>;
}>;


export type GetRecentTasksQuery = { __typename?: 'Query', recentTasks: Array<{ __typename?: 'GenerationTask', id: string, prompt: string, type: GenerationType, status: TaskStatus, priorityTier: string, progressPct: number, previewUrl?: string | null, finalMediaUrl?: string | null, createdAt: string }> };

export type GetSystemMetricsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSystemMetricsQuery = { __typename?: 'Query', systemMetrics: { __typename?: 'WorkerMetrics', totalWorkers: number, activeInferring: number, queueDepthVip: number, queueDepthBatch: number, averageLatencyMs: number, costEfficiencyRatio: number } };

export type CreateGenerationMutationVariables = Exact<{
  input: CreateGenerationInput;
}>;


export type CreateGenerationMutation = { __typename?: 'Mutation', createGeneration: { __typename?: 'GenerationTask', id: string, status: TaskStatus, priorityTier: string, currentStep: number, totalSteps: number, createdAt: string } };

export type CancelGenerationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CancelGenerationMutation = { __typename?: 'Mutation', cancelGeneration: boolean };

export type OnGenerationProgressSubscriptionVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type OnGenerationProgressSubscription = { __typename?: 'Subscription', generationProgress: { __typename?: 'GenerationProgressUpdate', taskId: string, status: TaskStatus, progressPct: number, currentStep: number, totalSteps: number, previewUrl?: string | null, etaSeconds?: number | null } };

export type OnMetricsStreamSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnMetricsStreamSubscription = { __typename?: 'Subscription', metricsStream: { __typename?: 'WorkerMetrics', totalWorkers: number, activeInferring: number, queueDepthVip: number, queueDepthBatch: number, averageLatencyMs: number, costEfficiencyRatio: number } };


export const GetGenerationTaskDocument = gql`
    query GetGenerationTask($id: ID!) {
  generationTask(id: $id) {
    id
    userId
    prompt
    negativePrompt
    type
    modelId
    status
    priorityTier
    progressPct
    currentStep
    totalSteps
    previewUrl
    finalMediaUrl
    durationMs
    errorReason
    createdAt
    completedAt
  }
}
    `;

/**
 * __useGetGenerationTaskQuery__
 *
 * To run a query within a React component, call `useGetGenerationTaskQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGenerationTaskQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGenerationTaskQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGenerationTaskQuery(baseOptions: Apollo.QueryHookOptions<GetGenerationTaskQuery, GetGenerationTaskQueryVariables> & ({ variables: GetGenerationTaskQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>(GetGenerationTaskDocument, options);
      }
export function useGetGenerationTaskLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>(GetGenerationTaskDocument, options);
        }
// @ts-ignore
export function useGetGenerationTaskSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>;
export function useGetGenerationTaskSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenerationTaskQuery | undefined, GetGenerationTaskQueryVariables>;
export function useGetGenerationTaskSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>(GetGenerationTaskDocument, options);
        }
export type GetGenerationTaskQueryHookResult = ReturnType<typeof useGetGenerationTaskQuery>;
export type GetGenerationTaskLazyQueryHookResult = ReturnType<typeof useGetGenerationTaskLazyQuery>;
export type GetGenerationTaskSuspenseQueryHookResult = ReturnType<typeof useGetGenerationTaskSuspenseQuery>;
export type GetGenerationTaskQueryResult = Apollo.QueryResult<GetGenerationTaskQuery, GetGenerationTaskQueryVariables>;
export const GetRecentTasksDocument = gql`
    query GetRecentTasks($limit: Int, $status: TaskStatus) {
  recentTasks(limit: $limit, status: $status) {
    id
    prompt
    type
    status
    priorityTier
    progressPct
    previewUrl
    finalMediaUrl
    createdAt
  }
}
    `;

/**
 * __useGetRecentTasksQuery__
 *
 * To run a query within a React component, call `useGetRecentTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentTasksQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetRecentTasksQuery(baseOptions?: Apollo.QueryHookOptions<GetRecentTasksQuery, GetRecentTasksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecentTasksQuery, GetRecentTasksQueryVariables>(GetRecentTasksDocument, options);
      }
export function useGetRecentTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecentTasksQuery, GetRecentTasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecentTasksQuery, GetRecentTasksQueryVariables>(GetRecentTasksDocument, options);
        }
// @ts-ignore
export function useGetRecentTasksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecentTasksQuery, GetRecentTasksQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecentTasksQuery, GetRecentTasksQueryVariables>;
export function useGetRecentTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentTasksQuery, GetRecentTasksQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecentTasksQuery | undefined, GetRecentTasksQueryVariables>;
export function useGetRecentTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentTasksQuery, GetRecentTasksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecentTasksQuery, GetRecentTasksQueryVariables>(GetRecentTasksDocument, options);
        }
export type GetRecentTasksQueryHookResult = ReturnType<typeof useGetRecentTasksQuery>;
export type GetRecentTasksLazyQueryHookResult = ReturnType<typeof useGetRecentTasksLazyQuery>;
export type GetRecentTasksSuspenseQueryHookResult = ReturnType<typeof useGetRecentTasksSuspenseQuery>;
export type GetRecentTasksQueryResult = Apollo.QueryResult<GetRecentTasksQuery, GetRecentTasksQueryVariables>;
export const GetSystemMetricsDocument = gql`
    query GetSystemMetrics {
  systemMetrics {
    totalWorkers
    activeInferring
    queueDepthVip
    queueDepthBatch
    averageLatencyMs
    costEfficiencyRatio
  }
}
    `;

/**
 * __useGetSystemMetricsQuery__
 *
 * To run a query within a React component, call `useGetSystemMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSystemMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSystemMetricsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSystemMetricsQuery(baseOptions?: Apollo.QueryHookOptions<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>(GetSystemMetricsDocument, options);
      }
export function useGetSystemMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>(GetSystemMetricsDocument, options);
        }
// @ts-ignore
export function useGetSystemMetricsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>;
export function useGetSystemMetricsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSystemMetricsQuery | undefined, GetSystemMetricsQueryVariables>;
export function useGetSystemMetricsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>(GetSystemMetricsDocument, options);
        }
export type GetSystemMetricsQueryHookResult = ReturnType<typeof useGetSystemMetricsQuery>;
export type GetSystemMetricsLazyQueryHookResult = ReturnType<typeof useGetSystemMetricsLazyQuery>;
export type GetSystemMetricsSuspenseQueryHookResult = ReturnType<typeof useGetSystemMetricsSuspenseQuery>;
export type GetSystemMetricsQueryResult = Apollo.QueryResult<GetSystemMetricsQuery, GetSystemMetricsQueryVariables>;
export const CreateGenerationDocument = gql`
    mutation CreateGeneration($input: CreateGenerationInput!) {
  createGeneration(input: $input) {
    id
    status
    priorityTier
    currentStep
    totalSteps
    createdAt
  }
}
    `;
export type CreateGenerationMutationFn = Apollo.MutationFunction<CreateGenerationMutation, CreateGenerationMutationVariables>;

/**
 * __useCreateGenerationMutation__
 *
 * To run a mutation, you first call `useCreateGenerationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGenerationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGenerationMutation, { data, loading, error }] = useCreateGenerationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGenerationMutation(baseOptions?: Apollo.MutationHookOptions<CreateGenerationMutation, CreateGenerationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGenerationMutation, CreateGenerationMutationVariables>(CreateGenerationDocument, options);
      }
export type CreateGenerationMutationHookResult = ReturnType<typeof useCreateGenerationMutation>;
export type CreateGenerationMutationResult = Apollo.MutationResult<CreateGenerationMutation>;
export type CreateGenerationMutationOptions = Apollo.BaseMutationOptions<CreateGenerationMutation, CreateGenerationMutationVariables>;
export const CancelGenerationDocument = gql`
    mutation CancelGeneration($id: ID!) {
  cancelGeneration(id: $id)
}
    `;
export type CancelGenerationMutationFn = Apollo.MutationFunction<CancelGenerationMutation, CancelGenerationMutationVariables>;

/**
 * __useCancelGenerationMutation__
 *
 * To run a mutation, you first call `useCancelGenerationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelGenerationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelGenerationMutation, { data, loading, error }] = useCancelGenerationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCancelGenerationMutation(baseOptions?: Apollo.MutationHookOptions<CancelGenerationMutation, CancelGenerationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelGenerationMutation, CancelGenerationMutationVariables>(CancelGenerationDocument, options);
      }
export type CancelGenerationMutationHookResult = ReturnType<typeof useCancelGenerationMutation>;
export type CancelGenerationMutationResult = Apollo.MutationResult<CancelGenerationMutation>;
export type CancelGenerationMutationOptions = Apollo.BaseMutationOptions<CancelGenerationMutation, CancelGenerationMutationVariables>;
export const OnGenerationProgressDocument = gql`
    subscription OnGenerationProgress($taskId: ID!) {
  generationProgress(taskId: $taskId) {
    taskId
    status
    progressPct
    currentStep
    totalSteps
    previewUrl
    etaSeconds
  }
}
    `;

/**
 * __useOnGenerationProgressSubscription__
 *
 * To run a query within a React component, call `useOnGenerationProgressSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnGenerationProgressSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnGenerationProgressSubscription({
 *   variables: {
 *      taskId: // value for 'taskId'
 *   },
 * });
 */
export function useOnGenerationProgressSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnGenerationProgressSubscription, OnGenerationProgressSubscriptionVariables> & ({ variables: OnGenerationProgressSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnGenerationProgressSubscription, OnGenerationProgressSubscriptionVariables>(OnGenerationProgressDocument, options);
      }
export type OnGenerationProgressSubscriptionHookResult = ReturnType<typeof useOnGenerationProgressSubscription>;
export type OnGenerationProgressSubscriptionResult = Apollo.SubscriptionResult<OnGenerationProgressSubscription>;
export const OnMetricsStreamDocument = gql`
    subscription OnMetricsStream {
  metricsStream {
    totalWorkers
    activeInferring
    queueDepthVip
    queueDepthBatch
    averageLatencyMs
    costEfficiencyRatio
  }
}
    `;

/**
 * __useOnMetricsStreamSubscription__
 *
 * To run a query within a React component, call `useOnMetricsStreamSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnMetricsStreamSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnMetricsStreamSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnMetricsStreamSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnMetricsStreamSubscription, OnMetricsStreamSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnMetricsStreamSubscription, OnMetricsStreamSubscriptionVariables>(OnMetricsStreamDocument, options);
      }
export type OnMetricsStreamSubscriptionHookResult = ReturnType<typeof useOnMetricsStreamSubscription>;
export type OnMetricsStreamSubscriptionResult = Apollo.SubscriptionResult<OnMetricsStreamSubscription>;