import { useQuery } from '@tanstack/react-query';
import { fetchObjectById } from '../lib/api';
import { formatCoordinate, formatMagnitude } from '../lib/utils';
import './ObjectPanel.css';

interface ObjectPanelProps {
  objectId: string | null;
  onClose: () => void;
  onAskAI: (objectId: string) => void;
}

export function ObjectPanel({ objectId, onClose, onAskAI }: ObjectPanelProps) {
  const { data: object, isLoading, error } = useQuery({
    queryKey: ['object', objectId],
    queryFn: () => fetchObjectById(objectId!),
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!objectId) return null;

  return (
    <div className="object-panel" role="dialog" aria-labelledby="panel-title">
      <div className="panel-header">
        <h2 id="panel-title">Object Details</h2>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="panel-content">
        {isLoading && <div className="loading">Loading...</div>}
        
        {error && (
          <div className="error">
            Failed to load object details: {(error as Error).message}
          </div>
        )}

        {object && (
          <>
            <section className="section">
              <h3>{object.name}</h3>
              {object.altNames && object.altNames.length > 0 && (
                <p className="alt-names">
                  Also known as: {object.altNames.join(', ')}
                </p>
              )}
            </section>

            <section className="section">
              <h4>Coordinates</h4>
              <dl className="details-list">
                <dt>Right Ascension:</dt>
                <dd>{formatCoordinate(object.ra, 'ra')}</dd>
                
                <dt>Declination:</dt>
                <dd>{formatCoordinate(object.dec, 'dec')}</dd>
              </dl>
            </section>

            {object.magnitude != null && (
              <section className="section">
                <h4>Magnitude</h4>
                <p>{formatMagnitude(object.magnitude)}</p>
              </section>
            )}

            {object.objectType && (
              <section className="section">
                <h4>Type</h4>
                <p>{object.objectType}</p>
              </section>
            )}

            {object.spectralType && (
              <section className="section">
                <h4>Spectral Type</h4>
                <p>{object.spectralType}</p>
              </section>
            )}

            {object.redshift != null && (
              <section className="section">
                <h4>Redshift</h4>
                <p>{object.redshift.toFixed(6)}</p>
              </section>
            )}

            {object.distance_ly_est && (
              <section className="section">
                <h4>Estimated Distance</h4>
                <p>{object.distance_ly_est}</p>
              </section>
            )}

            {object.size_est && (
              <section className="section">
                <h4>Estimated Size</h4>
                <p>{object.size_est}</p>
              </section>
            )}

            {object.description && (
              <section className="section">
                <h4>Description</h4>
                <p>{object.description}</p>
              </section>
            )}

            {object.source && (
              <section className="section source">
                <small>Source: {object.source}</small>
              </section>
            )}

            <div className="panel-actions">
              <button
                className="ask-ai-btn"
                onClick={() => onAskAI(object.id)}
              >
                Ask AI about this object
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
