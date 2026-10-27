import React from 'react';

export default function StatusBadge({ s }) {
    return <span className={'status ' + s}>{String(s).replaceAll('_', ' ')}</span>;
}
