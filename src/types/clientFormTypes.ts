// src/types/clientFormTypes.ts

export interface ClientFormData {
  name: string;
  email: string;
  companyName: string;
  description?: string;
  accountOwner?: string;
  contactPhone?: string;
  technicalContactEmail?: string;
  billingEmail?: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
}

export const defaultClientFormData: ClientFormData = {
  name: '',
  email: '',
  companyName: '',
  description: '',
  accountOwner: '',
  contactPhone: '',
  technicalContactEmail: '',
  billingEmail: '',
  tier: 'basic',
};

export const FORM_VALIDATION_RULES = {
  name: {
    required: 'Application name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Invalid email address',
    },
  },
  companyName: {
    required: 'Company name is required',
    minLength: {
      value: 2,
      message: 'Company name must be at least 2 characters',
    },
    maxLength: {
      value: 100,
      message: 'Company name must be less than 100 characters',
    },
  },
  technicalContactEmail: {
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Invalid email address',
    },
  },
  billingEmail: {
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Invalid email address',
    },
  },
  contactPhone: {
    pattern: {
      value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: 'Invalid phone number format',
    },
  },
  tier: {
    required: 'Tier is required',
  },
};

export const FORM_SECTIONS = {
  basicInfo: {
    title: 'Basic Information',
    description: 'Enter the basic details about the API client',
  },
  contacts: {
    title: 'Contact Information',
    description: 'Specify contacts for account, technical and billing purposes',
  },
  settings: {
    title: 'Account Settings',
    description: 'Configure account tier and limits',
  },
};

export const CLIENT_TIERS = [
  {
    value: 'free',
    label: 'Free',
    description: 'Limited API access with basic rate limits',
    quota: 1000,
    rateLimit: 10,
  },
  {
    value: 'basic',
    label: 'Basic',
    description: 'Standard API access with moderate rate limits',
    quota: 10000,
    rateLimit: 50,
  },
  {
    value: 'premium',
    label: 'Premium',
    description: 'Enhanced API access with higher rate limits',
    quota: 100000,
    rateLimit: 100,
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Unlimited API access with custom rate limits',
    quota: 1000000,
    rateLimit: 500,
  },
];
