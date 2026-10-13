import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 500 },
    { duration: '30s', target: 2000 },
    { duration: '20s', target: 5000 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<25'], // 99% of requests must resolve under 25ms
    http_req_failed: ['rate<0.001'], // Less than 0.1% failures
  },
};

const GRAPHQL_MUTATION = `
  mutation CreateGen($input: CreateGenerationInput!) {
    createGeneration(input: $input) {
      id
      status
      priorityTier
      currentStep
      totalSteps
    }
  }
`;

export default function () {
  const payload = JSON.stringify({
    query: GRAPHQL_MUTATION,
    variables: {
      input: {
        prompt: `Cinematic cyberpunk render #${__VU}-${__ITER}`,
        type: 'IMAGE_TEXT_TO_IMAGE',
        modelId: 'model_flux_dev',
        steps: 25,
      },
    },
  });

  const res = http.post('http://localhost:8080/graphql', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has task id': (r) => {
      const body = JSON.parse(r.body);
      return body.data && body.data.createGeneration && body.data.createGeneration.id;
    },
  });

  sleep(0.005);
}
