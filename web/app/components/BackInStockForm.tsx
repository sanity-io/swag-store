import React, {useState, useCallback} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';

type BackInStockFormProps = {
  variant: ProductFragment['selectedOrFirstAvailableVariant'];
  className?: string;
};

export function BackInStockForm({
  variant,
  className = '',
}: BackInStockFormProps) {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  console.log('variant', variant);
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPending(true);
      setError('');
      setSuccess(false);

      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('acceptsMarketing', 'false'); // Default to false for waitlist
        if (variant?.id) {
          formData.append('productId', variant.id);
        }

        const response = await fetch('/newsletter', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as {
          success?: boolean;
          alreadySubscribed?: boolean;
          message?: string;
        };

        if (data.success) {
          setSuccess(true);
          setEmail('');
          setAlreadySubscribed(false);
        } else if (data.alreadySubscribed) {
          setAlreadySubscribed(true);
          setSuccess(false);
          setError('');
        } else {
          setError(data.message || 'There was an error joining the waitlist.');
        }
      } catch (err) {
        console.error('Waitlist error:', err);
        setError('There was an error joining the waitlist. Please try again.');
      } finally {
        setPending(false);
      }
    },
    [email, variant?.id],
  );

  if (success) {
    return (
      <div className={`back-in-stock-success ${className}`}>
        <div className="text-green-600 font-medium text-center py-4">
          You've been added to the waitlist! We'll notify you when this product
          is back in stock.
        </div>
      </div>
    );
  }

  if (alreadySubscribed) {
    return (
      <div className={`back-in-stock-already-subscribed ${className}`}>
        <div className="text-black font-medium text-center py-4">
          You're already on the waitlist for this product! We'll notify you when
          it's back in stock.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`back-in-stock-form p-4 bg-black rounded-md mt-4 text-white ${className}`}
    >
      <div className="text-left mb-4">
        <h4 className="text-24 font-sans  mb-2">This item is sold out</h4>
        <p className="text-sm text-white mb-4">
          Join the waitlist to be notified when it's back in stock
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 relative w-full">
        <div>
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-3 rounded-full py-2 border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={pending}
          />
        </div>

        <button
          type="submit"
          disabled={pending || !email}
          className="!w-[130px] bg-white absolute h-[calc(100%-4px)] bottom-[2px] right-[3px] text-black py-2 px-4 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {pending ? 'Joining waitlist...' : 'Join Waitlist'}
        </button>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
}
