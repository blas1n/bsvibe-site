import type { Locale } from '@/i18n';

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface ProductPricing {
  product: string;
  accent: string;
  tiers: PricingTier[];
}

const pricingKo: ProductPricing[] = [
  {
    product: 'BSGateway',
    accent: '#f59e0b',
    tiers: [
      {
        name: 'Free',
        price: '₩0',
        period: '/월',
        description: '개인 프로젝트에 적합',
        features: ['월 10,000 API 호출', '기본 라우팅', '커뮤니티 지원'],
        cta: '무료로 시작',
      },
      {
        name: 'Pro',
        price: '미정',
        period: '/월',
        description: '성장하는 팀을 위한 플랜',
        features: ['무제한 API 호출', '스마트 라우팅', '비용 최적화', '우선 지원'],
        cta: '출시 알림 받기',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '문의',
        period: '',
        description: '대규모 조직을 위한 맞춤 플랜',
        features: ['전용 인프라', 'SLA 보장', '전담 매니저', '커스텀 통합'],
        cta: '문의하기',
      },
    ],
  },
  {
    product: 'BSNexus',
    accent: '#3b82f6',
    tiers: [
      {
        name: 'Free',
        price: '₩0',
        period: '/월',
        description: '에이전트 오케스트레이션 체험',
        features: ['에이전트 3개', '기본 템플릿', '커뮤니티 지원'],
        cta: '무료로 시작',
      },
      {
        name: 'Pro',
        price: '미정',
        period: '/월',
        description: '팀 생산성 극대화',
        features: ['무제한 에이전트', '커스텀 워크플로우', '팀 협업', '우선 지원'],
        cta: '출시 알림 받기',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '문의',
        period: '',
        description: '조직 전체의 AI 오케스트레이션',
        features: ['전용 인프라', '감사 로그', 'SSO 연동', '커스텀 통합'],
        cta: '문의하기',
      },
    ],
  },
  {
    product: 'BSupervisor',
    accent: '#f43f5e',
    tiers: [
      {
        name: 'Free',
        price: '₩0',
        period: '/월',
        description: '기본 감사 및 안전 모니터링',
        features: ['월 1,000 감사 로그', '기본 규칙', '커뮤니티 지원'],
        cta: '무료로 시작',
      },
      {
        name: 'Pro',
        price: '미정',
        period: '/월',
        description: '고급 안전 관리',
        features: ['무제한 감사', '커스텀 규칙', '실시간 알림', '우선 지원'],
        cta: '출시 알림 받기',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '문의',
        period: '',
        description: '엔터프라이즈급 AI 거버넌스',
        features: ['규정 준수 보고', 'SOC2 지원', '전담 매니저', '커스텀 정책'],
        cta: '문의하기',
      },
    ],
  },
  {
    product: 'BSage',
    accent: '#10b981',
    tiers: [
      {
        name: 'Free',
        price: '₩0',
        period: '/월',
        description: '개인 지식 관리',
        features: ['노트 500개', '기본 검색', '커뮤니티 지원'],
        cta: '무료로 시작',
      },
      {
        name: 'Pro',
        price: '미정',
        period: '/월',
        description: '고급 지식 연결',
        features: ['무제한 노트', '온톨로지 연결', 'AI 요약', '우선 지원'],
        cta: '출시 알림 받기',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '문의',
        period: '',
        description: '조직 지식 플랫폼',
        features: ['팀 지식 공유', '접근 제어', '전담 매니저', 'API 통합'],
        cta: '문의하기',
      },
    ],
  },
];

const pricingEn: ProductPricing[] = [
  {
    product: 'BSGateway',
    accent: '#f59e0b',
    tiers: [
      {
        name: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Perfect for personal projects',
        features: ['10,000 API calls/mo', 'Basic routing', 'Community support'],
        cta: 'Start Free',
      },
      {
        name: 'Pro',
        price: 'TBD',
        period: '/mo',
        description: 'For growing teams',
        features: ['Unlimited API calls', 'Smart routing', 'Cost optimization', 'Priority support'],
        cta: 'Get Notified',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Contact',
        period: '',
        description: 'Custom plan for large organizations',
        features: ['Dedicated infra', 'SLA guarantee', 'Dedicated manager', 'Custom integrations'],
        cta: 'Contact Us',
      },
    ],
  },
  {
    product: 'BSNexus',
    accent: '#3b82f6',
    tiers: [
      {
        name: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Try agent orchestration',
        features: ['3 agents', 'Basic templates', 'Community support'],
        cta: 'Start Free',
      },
      {
        name: 'Pro',
        price: 'TBD',
        period: '/mo',
        description: 'Maximize team productivity',
        features: ['Unlimited agents', 'Custom workflows', 'Team collaboration', 'Priority support'],
        cta: 'Get Notified',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Contact',
        period: '',
        description: 'AI orchestration for the entire org',
        features: ['Dedicated infra', 'Audit logs', 'SSO integration', 'Custom integrations'],
        cta: 'Contact Us',
      },
    ],
  },
  {
    product: 'BSupervisor',
    accent: '#f43f5e',
    tiers: [
      {
        name: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Basic audit & safety monitoring',
        features: ['1,000 audit logs/mo', 'Basic rules', 'Community support'],
        cta: 'Start Free',
      },
      {
        name: 'Pro',
        price: 'TBD',
        period: '/mo',
        description: 'Advanced safety management',
        features: ['Unlimited audits', 'Custom rules', 'Real-time alerts', 'Priority support'],
        cta: 'Get Notified',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Contact',
        period: '',
        description: 'Enterprise AI governance',
        features: ['Compliance reports', 'SOC2 support', 'Dedicated manager', 'Custom policies'],
        cta: 'Contact Us',
      },
    ],
  },
  {
    product: 'BSage',
    accent: '#10b981',
    tiers: [
      {
        name: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Personal knowledge management',
        features: ['500 notes', 'Basic search', 'Community support'],
        cta: 'Start Free',
      },
      {
        name: 'Pro',
        price: 'TBD',
        period: '/mo',
        description: 'Advanced knowledge connections',
        features: ['Unlimited notes', 'Ontology linking', 'AI summaries', 'Priority support'],
        cta: 'Get Notified',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Contact',
        period: '',
        description: 'Organizational knowledge platform',
        features: ['Team sharing', 'Access control', 'Dedicated manager', 'API integration'],
        cta: 'Contact Us',
      },
    ],
  },
];

export function getPricing(locale: Locale): ProductPricing[] {
  return locale === 'en' ? pricingEn : pricingKo;
}
