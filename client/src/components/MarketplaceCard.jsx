import React from 'react';
import { UserRound, ArrowRight } from 'lucide-react';
import { money } from '../lib/format.js';

export default function MarketplaceCard({ item, kind, user, openAuth, setModal, getProfile }) {
    return  <article className="card"><div className="cardtop"><span className="badge">{kind === 'projects' ? 'OPEN PROJECT' : 'FREELANCE SERVICE'}</span><span className="price">{money(item.budget ?? item.price)}</span></div><h3>{item.title}</h3><p className="muted desc">{item.description}</p><div className="tags">{(item.skills || []).map(s => <span key={s}>{s}</span>)}</div>{item.matchScore !== undefined && <p className="match">{item.matchScore}% skill match</p>}<div className="cardbottom"><span onClick={() => item.freelancer ? getProfile(item.freelancer._id) : null} style={{ cursor: item.freelancer ? 'pointer' : 'default' }}><UserRound size={15}/>{item.client?.name || item.freelancer?.name || 'Member'}</span><button className="smallbtn" onClick={() => !user ? openAuth('login') : setModal({ type: kind === 'projects' ? 'apply' : 'order', item })}>{kind === 'projects' ? 'Send proposal' : 'Request service'} <ArrowRight size={15}/></button></div></article>;
}
