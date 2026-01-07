import { useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useViewSettingsStore } from '../stores/viewSettingsStore';

type CheckResult = {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
};

const PrintabilityMeter = () => {
  const { project } = useProjectStore();
  const { printability, showPrintabilityMeter } = useViewSettingsStore();

  const checks = useMemo((): CheckResult[] => {
    const results: CheckResult[] = [];
    const { board, routes, rules } = project;
    const { nozzleWidth, layerHeight, bedWidth, bedDepth } = printability;

    // Board size check
    const boardBounds = getBoardBounds(board.boundary);
    const boardWidth = boardBounds.maxX - boardBounds.minX;
    const boardHeight = boardBounds.maxY - boardBounds.minY;

    if (boardWidth > bedWidth || boardHeight > bedDepth) {
      results.push({
        name: 'Bed Size',
        status: 'error',
        message: `Board (${boardWidth.toFixed(0)}×${boardHeight.toFixed(0)}mm) exceeds bed (${bedWidth}×${bedDepth}mm)`,
      });
    } else if (boardWidth > bedWidth * 0.9 || boardHeight > bedDepth * 0.9) {
      results.push({
        name: 'Bed Size',
        status: 'warning',
        message: `Board uses >90% of bed area`,
      });
    } else {
      results.push({
        name: 'Bed Size',
        status: 'ok',
        message: `Fits within print bed`,
      });
    }

    // Wall thickness check
    const minWallCheck = rules.minWall >= nozzleWidth * 2;
    if (!minWallCheck) {
      results.push({
        name: 'Wall Thickness',
        status: 'error',
        message: `Min wall ${rules.minWall}mm < 2× nozzle (${nozzleWidth * 2}mm)`,
      });
    } else {
      results.push({
        name: 'Wall Thickness',
        status: 'ok',
        message: `Min wall ≥ 2× nozzle width`,
      });
    }

    // Channel depth check
    const channelDepths = routes.map((r) => r.depth);
    const maxDepth = Math.max(...channelDepths, 0);
    const minLayers = Math.ceil(maxDepth / layerHeight);

    if (maxDepth > board.thickness * 0.8) {
      results.push({
        name: 'Channel Depth',
        status: 'error',
        message: `Channels (${maxDepth}mm) too deep for ${board.thickness}mm board`,
      });
    } else if (maxDepth > 0) {
      results.push({
        name: 'Channel Depth',
        status: 'ok',
        message: `Channels need ${minLayers} layers at ${layerHeight}mm`,
      });
    } else {
      results.push({
        name: 'Channel Depth',
        status: 'ok',
        message: 'No channels defined',
      });
    }

    // Overhang check (channels with steep walls)
    const hasOverhangs = routes.some((r) => r.profile === 'V' && r.depth > r.width / 2);
    if (hasOverhangs) {
      results.push({
        name: 'Overhangs',
        status: 'warning',
        message: 'V-channels may need support or slower print',
      });
    } else {
      results.push({
        name: 'Overhangs',
        status: 'ok',
        message: 'No problematic overhangs',
      });
    }

    // Layer height compatibility
    const totalLayers = Math.ceil(board.thickness / layerHeight);
    if (totalLayers < 5) {
      results.push({
        name: 'Layer Count',
        status: 'warning',
        message: `Only ${totalLayers} layers - consider smaller layer height`,
      });
    } else {
      results.push({
        name: 'Layer Count',
        status: 'ok',
        message: `${totalLayers} layers for board thickness`,
      });
    }

    return results;
  }, [project, printability]);

  if (!showPrintabilityMeter) return null;

  const errorCount = checks.filter((c) => c.status === 'error').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const okCount = checks.filter((c) => c.status === 'ok').length;
  const total = checks.length;
  const score = Math.round(((okCount + warningCount * 0.5) / total) * 100);

  const getScoreColor = () => {
    if (errorCount > 0) return '#f44336';
    if (warningCount > 0) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <h4
        style={{
          margin: '0 0 10px 0',
          fontSize: '13px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>🖨️</span> Printability
      </h4>

      {/* Score bar */}
      <div style={{ marginBottom: '10px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            marginBottom: '4px',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Print Score</span>
          <span style={{ color: getScoreColor(), fontWeight: 'bold' }}>{score}%</span>
        </div>
        <div
          style={{
            height: '6px',
            background: 'var(--border-color)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${score}%`,
              background: getScoreColor(),
              borderRadius: '3px',
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        </div>
      </div>

      {/* Check results */}
      <div style={{ fontSize: '10px' }}>
        {checks.map((check, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              padding: '4px 0',
              borderBottom: i < checks.length - 1 ? '1px solid var(--border-color)' : 'none',
            }}
          >
            <span style={{ fontSize: '12px' }}>
              {check.status === 'ok' && '✅'}
              {check.status === 'warning' && '⚠️'}
              {check.status === 'error' && '❌'}
            </span>
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{check.name}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '1px' }}>
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Printer settings summary */}
      <div
        style={{
          marginTop: '10px',
          padding: '8px',
          background: 'var(--bg-sidebar)',
          borderRadius: '4px',
          fontSize: '10px',
          color: 'var(--text-secondary)',
        }}
      >
        <div>Nozzle: {printability.nozzleWidth}mm</div>
        <div>Layer: {printability.layerHeight}mm</div>
        <div>
          Bed: {printability.bedWidth}×{printability.bedDepth}mm
        </div>
      </div>
    </div>
  );
};

/** Get bounding box of board boundary */
const getBoardBounds = (boundary: [number, number][]) => {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const [x, y] of boundary) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY };
};

export default PrintabilityMeter;
