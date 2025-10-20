import React, {useState, useCallback} from 'react';
import {useActionData, useNavigation} from 'react-router';

export type NewsletterActionState = {
  id?: number;
  payload?: Record<string, string>;
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
  alreadySubscribed?: boolean;
};

type NewsletterProps = {
  className?: string;
  showMarketingOptIn?: boolean;
  productId?: string;
  title?: string;
};

export function Newsletter({
  className = '',
  showMarketingOptIn = false,
  productId,
  title = 'Join our newsletter',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(
    showMarketingOptIn ? 'accepted' : 'declined',
  );
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const actionData = useActionData<NewsletterActionState>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting' || pending;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPending(true);
      setSuccess(false);

      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('acceptsMarketing', acceptsMarketing);
        if (productId) {
          formData.append('productId', productId);
        }

        const response = await fetch('/newsletter', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as NewsletterActionState;

        if (data.success) {
          setSuccess(true);
          setEmail('');
          setAcceptsMarketing(showMarketingOptIn ? 'accepted' : 'declined');
          setAlreadySubscribed(false);
        } else if (data.alreadySubscribed) {
          setAlreadySubscribed(true);
          setSuccess(false);
        }
      } catch (error) {
        console.error('Newsletter subscription error:', error);
      } finally {
        setPending(false);
      }
    },
    [email, acceptsMarketing, productId, showMarketingOptIn],
  );

  if (success) {
    return (
      <div className={`newsletter-success ${className}`}>
        <div className="text-black font-medium">
          {actionData?.message || 'Successfully subscribed!'}
        </div>
      </div>
    );
  }

  if (alreadySubscribed) {
    return (
      <div className={`newsletter-already-subscribed ${className}`}>
        <div className="text-black font-medium">
          {actionData?.message || 'You are already subscribed!'}
        </div>
      </div>
    );
  }

  return (
    <div className={`newsletter-form w-full ${className}`}>
      <div className="newsletter-header mb-4">
        <h3 className="text-24 font-sans text-black">{title}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative w-full">
        <div className="w-full">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-3 py-2 rounded-full border border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-yellow"
            disabled={isSubmitting}
          />
          {actionData?.errors?.email && (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.email}
            </p>
          )}
        </div>

        {showMarketingOptIn && (
          <div className="flex items-center">
            <input
              id="acceptsMarketing"
              name="acceptsMarketing"
              type="checkbox"
              checked={acceptsMarketing === 'accepted'}
              onChange={(e) =>
                setAcceptsMarketing(e.target.checked ? 'accepted' : 'declined')
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label
              htmlFor="acceptsMarketing"
              className="ml-2 text-sm text-gray-700"
            >
              I want to receive marketing emails and updates
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="!w-[110px] h-[calc(100%-4px)] bg-black absolute bottom-[2px] right-[3px] text-white py-2 px-4 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Subscribing...'
            : productId
              ? 'Join Waitlist'
              : 'Subscribe'}
        </button>

        {actionData?.message && !actionData.success && (
          <p className="text-sm text-red-600">{actionData.message}</p>
        )}
      </form>
    </div>
  );
}
