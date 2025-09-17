import {useDebug} from '~/contexts/DebugContext';

interface ProductAgeData {
  _key: string;
  product: {
    _id: string;
    title?: string;
    store?: {
      title?: string;
      gid?: string;
    };
  };
  lastUpdated: string;
  createdAt: string;
  ageInDays: number;
  updatedAgeInDays: number;
  isOld: boolean;
}

interface ProductAgeAnalysisProps {
  productAgeAnalysis?: ProductAgeData[];
}

export function ProductAgeAnalysis({
  productAgeAnalysis,
}: ProductAgeAnalysisProps) {
  const {commentsEnabled} = useDebug();

  if (!commentsEnabled || !productAgeAnalysis?.length) {
    return null;
  }

  const oldProducts = productAgeAnalysis.filter((p) => p.isOld);
  const freshProducts = productAgeAnalysis.filter((p) => !p.isOld);
  const averageAge = Math.round(
    productAgeAnalysis.reduce((sum, p) => sum + p.ageInDays, 0) /
      productAgeAnalysis.length,
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-black/90 text-white border border-white/20 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">📊 Product Age Analysis</h3>
          <div className="text-xs bg-white/10 px-2 py-1 rounded">
            {productAgeAnalysis.length} products
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Avg Age (Created):</span>
            <span className="font-mono">{averageAge} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🔴 Old Products:</span>
            <span className="font-mono">{oldProducts.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🟢 Fresh Products:</span>
            <span className="font-mono">{freshProducts.length}</span>
          </div>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold mb-2 hover:text-white/80">
            View All Products ({productAgeAnalysis.length})
          </summary>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {productAgeAnalysis.map((item) => {
              const productTitle =
                item.product.store?.title || item.product.title || 'Untitled';
              const createdDate = new Date(item.createdAt).toLocaleDateString();
              const lastUpdated = new Date(
                item.lastUpdated,
              ).toLocaleDateString();

              return (
                <div
                  key={item._key}
                  className={`p-2 rounded text-xs border ${
                    item.isOld
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-green-500/30 bg-green-500/10'
                  }`}
                >
                  <div className="font-semibold truncate" title={productTitle}>
                    {item.isOld ? '🔴' : '🟢'} {productTitle}
                  </div>
                  <div className="text-white/70 space-y-1">
                    <div>
                      Created: {item.ageInDays}d ago ({createdDate})
                    </div>
                    <div>
                      Updated: {item.updatedAgeInDays}d ago ({lastUpdated})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </details>

        {oldProducts.length > 0 && (
          <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs">
            <strong>⚠️ Action Needed:</strong> {oldProducts.length} product
            {oldProducts.length === 1 ? '' : 's'}{' '}
            {oldProducts.length === 1 ? 'was' : 'were'} created more than 30
            days ago and may need refreshing or removal.
          </div>
        )}
      </div>
    </div>
  );
}
