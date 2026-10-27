import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import api from './lib/api.js';
import { money, err, split } from './lib/format.js';
import { usePayments } from './hooks/usePayments.js';
import { useMessages } from './hooks/useMessages.js';
import MarketplaceCard from './components/MarketplaceCard.jsx';
import StatusBadge from './components/StatusBadge.jsx';
import { BriefcaseBusiness, Search, Plus, UserRound, LogOut, ArrowRight, Layers, CheckCircle2, Menu, Star, Code2, Clock3, IndianRupee } from 'lucide-react';
import './style.css';
function App() {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('explore');
    const [kind, setKind] = useState('projects');
    const [items, setItems] = useState([]);
    const [mine, setMine] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [proposals, setProposals] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');
    const [authMode, setAuthMode] = useState('login');
    const [dashboard, setDashboard] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [filters, setFilters] = useState({ skill: '', minBudget: '', maxBudget: '', sort: 'newest' });
    const [recommended, setRecommended] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({ skill: '', minBudget: '', maxBudget: '', sort: 'newest' });
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const marketplaceRequest = useRef(0);
    const hasDraftFilters = Boolean(filters.skill.trim() || filters.minBudget !== '' || filters.maxBudget !== '' || filters.sort !== 'newest');
    const hasAppliedFilters = Boolean(appliedFilters.skill.trim() || appliedFilters.minBudget !== '' || appliedFilters.maxBudget !== '' || appliedFilters.sort !== 'newest');
    const notify = t => { setMessage(t); setTimeout(() => setMessage(''), 4500); };
    const load = async () => { setLoading(true); try {
        const requestId = ++marketplaceRequest.current;
        const marketplaceResponse = await api.get(kind === 'projects' ? '/projects' : '/services', { params: { search: debouncedSearch, ...appliedFilters } });
        if (recommended && user?.role === 'freelancer' && kind === 'projects') {
            const rec = await api.get('/recommendations');
            if (requestId === marketplaceRequest.current) setItems(rec.data);
        }
        else
            if (requestId === marketplaceRequest.current) setItems(marketplaceResponse.data);
        if (user) {
            const requests = [api.get('/contracts/mine'), api.get('/orders/mine'), api.get(user.role === 'client' ? '/projects/mine' : '/services/mine')];
            const [c, o, m] = await Promise.all(requests);
            setContracts(c.data);
            setOrders(o.data);
            setMine(m.data);
            const d = await api.get('/dashboard');
            setDashboard(d.data);
            if (user.role === 'client') {
                const rev = await api.get('/reviews/mine');
                setReviews(rev.data);
            }
            if (user.role === 'freelancer') {
                const a = await api.get('/proposals/mine');
                setProposals({ mine: a.data });
            }
        }
    }
    catch (e) {
        notify(err(e));
    }
    finally {
        setLoading(false);
    } };
    useEffect(() => { if (localStorage.getItem('sb_token'))
        api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('sb_token')); }, []);
    useEffect(() => { load(); }, [user, kind, tab, recommended, debouncedSearch, appliedFilters]);
    useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250); return () => clearTimeout(timer); }, [search]);
    useEffect(() => { const timer = setTimeout(() => setAppliedFilters(current => ({ ...current, skill: filters.skill.trim() })), 250); return () => clearTimeout(timer); }, [filters.skill]);
    const action = async (path, data = {}, onSuccess) => { try {
        await (path.endsWith('/toggle') ? api.patch(path, data) : api.post(path, data));
        notify('Success! Changes saved.');
        setModal(null);
        await load();
        onSuccess?.();
    }
    catch (e) {
        notify(err(e));
    } };
    const auth = async (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)); try {
        const r = await api.post('/auth/' + authMode, f);
        localStorage.setItem('sb_token', r.data.token);
        setUser(r.data.user);
        setModal(null);
        notify('Welcome to SkillBridge!');
    }
    catch (e) {
        notify(err(e));
    } };
    const openAuth = m => { setAuthMode(m); setModal({ type: 'auth' }); };
    const { payingKey, payForWork, isPaid } = usePayments({ user, tab, notify, load });
    const { messageDraft, setMessageDraft, sendingMessage, sendConversationMessage, getConversation } = useMessages({ modal, setModal, notify });
    const getProfile = async (id) => { try {
        const result = await api.get(`/freelancers/${id}`);
        setModal({ type: 'profile', ...result.data });
    }
    catch (e) {
        notify(err(e));
    } };
    const openProposals = async (p) => { try {
        const r = await api.get(`/projects/${p._id}/proposals`);
        setModal({ type: 'proposals', project: p, rows: r.data });
    }
    catch (e) {
        notify(err(e));
    } };
    const onSubmit = async (e, endpoint, convert = []) => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.currentTarget)); for (const k of convert)
        v[k] = Number(v[k]); if (v.skills)
        v.skills = split(v.skills); await action(endpoint, v); };
    return (
        <>
            <header>
                <div className="shell nav">
                <a className="brand" onClick={() => setTab('explore')}>
                <span className="brandmark">
                <Layers size={21}/>
                </span>skill<span>bridge</span>
                <small>BETA</small>
                </a>
                <nav>
                <button className={tab === 'explore' ? 'active' : ''} onClick={() => setTab('explore')}>Explore</button>{user && <>
                <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
                <button className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}>My work</button>
                <button onClick={() => setModal({ type: 'editprofile' })}>Profile</button>
                </>}</nav>
                <div className="navright">{user ? <>
                <span className="identity">{user.name} <em>{user.role}</em>
                </span>
                <button className="iconbtn" title="Log out" onClick={() => { localStorage.removeItem('sb_token'); setUser(null); setTab('explore'); }}>
                <LogOut size={19}/>
                </button>
                </> : <>
                <button className="ghost" onClick={() => openAuth('login')}>Log in</button>
                <button className="primary" onClick={() => openAuth('register')}>Get started <ArrowRight size={16}/>
                </button>
                </>}</div>
                </div>
                </header>



    {tab === 'explore' ? <>
                <section className="hero">
                <div className="shell herogrid">
                <div>
                <div className="eyebrow">
                <span className="dot"/> THE WORK MARKETPLACE FOR WHAT'S NEXT</div>
                <h1>Great work starts<br />with the <i>right people.</i>
                </h1>
                <p>Discover exciting projects, offer your expertise, and turn great ideas into real work. One platform, endless possibilities.</p>
                <div className="heroactions">
                <button className="primary large" onClick={() => { setKind('projects'); document.getElementById('market')?.scrollIntoView({ behavior: 'smooth' }); }}>Find a project <ArrowRight size={18}/>
                </button>
                <button className="outline large" onClick={() => { setKind('services'); document.getElementById('market')?.scrollIntoView({ behavior: 'smooth' }); }}>Browse services</button>
                </div>
                <div className="herofoot">
                <div className="avatarstack">
                <b>A</b>
                <b>M</b>
                <b>S</b>
                </div>
                <span>Built for creators, founders & doers</span>
                </div>
                </div>
                <div className="heroart">
                <div className="floatlabel one">
                <CheckCircle2 size={18}/> Find the perfect fit</div>
                <div className="artwindow">
                <div className="windowdots">
                <i />
                <i />
                <i />
                </div>
                <div className="arthead">YOUR NEXT OPPORTUNITY <span>↗</span>
                </div>
                <div className="articon">
                <Code2 size={35}/>
                </div>
                <h3>Build something<br />extraordinary.</h3>
                <p>Connect. Collaborate. Create.</p>
                <div className="artskills">
                <span>Design</span>
                <span>Development</span>
                <span>Creative</span>
                </div>
                </div>
                <div className="floatlabel two">
                <Star size={18} fill="currentColor"/> Your skills have value</div>
                </div>
                </div>
                </section>
                <section id="market" className="shell market">
                <div className="sectiontop">
                <div>
                <span className="overline">THE MARKETPLACE</span>
                <h2>Find your next opportunity<span className="accent">.</span>
                </h2>
                <p>Browse work that inspires you, or discover talented professionals.</p>
                </div>{user && <button className="primary" onClick={() => setModal({ type: user.role === 'client' ? 'project' : 'service' })}>
                <Plus size={17}/> {user.role === 'client' ? 'Post a project' : 'List a service'}</button>}</div>
                <div className="toolbar">
                <div className="switch">
                <button className={kind === 'projects' ? 'selected' : ''} onClick={() => setKind('projects')}>
                <BriefcaseBusiness size={17}/> Projects</button>
                <button className={kind === 'services' ? 'selected' : ''} onClick={() => setKind('services')}>
                <Layers size={17}/> Services</button>
                </div>
                <div className="search" role="search">
                <Search size={18}/>
                <input placeholder="Search by keyword..." value={search} onChange={e => setSearch(e.target.value)}/>
                <span className="live-search-label" aria-live="polite">Live search</span>
                </div>
                </div>
                <div className="filterbar">
                <input aria-label="Filter by skill" placeholder="Live skill search (e.g. node, node.js)" value={filters.skill} onChange={e => setFilters({ ...filters, skill: e.target.value })}/>
                <input aria-label="Minimum budget" type="number" min="0" placeholder="Min ₹" value={filters.minBudget} onChange={e => setFilters({ ...filters, minBudget: e.target.value })}/>
                <input aria-label="Maximum budget" type="number" min="0" placeholder="Max ₹" value={filters.maxBudget} onChange={e => setFilters({ ...filters, maxBudget: e.target.value })}/>
                <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
                <option value="newest">Newest</option>
                <option value="budget_asc">Price low to high</option>
                <option value="budget_desc">Price high to low</option>
                </select>
                <button type="button" className="outline" disabled={!hasDraftFilters && !hasAppliedFilters} onClick={() => setAppliedFilters({ ...filters })}>Apply filters</button>
                <button type="button" className="outline clear-filters" disabled={!hasDraftFilters && !hasAppliedFilters} onClick={() => { const empty = { skill: '', minBudget: '', maxBudget: '', sort: 'newest' }; setFilters(empty); setAppliedFilters(empty); setRecommended(false); }}>Remove filters</button>{user?.role === 'freelancer' && kind === 'projects' && <button className="outline" onClick={() => setRecommended(!recommended)}>{recommended ? 'All projects' : 'Recommended for me'}</button>}</div>{loading ? <div className="empty">Loading marketplace...</div> : items.length ? <div className="cards">{items.map(x => <MarketplaceCard key={x._id} item={x} kind={kind} user={user} openAuth={openAuth} setModal={setModal} getProfile={getProfile}/>)}</div> : <div className="empty">
                <BriefcaseBusiness size={30}/>
                <h3>No {kind} found yet</h3>
                <p>Be the first to add something, or try another search.</p>
                </div>}</section>
                </>
                : tab === 'dashboard' ? <section className="shell inner">
                <div className="sectiontop">
                <div>
                <span className="overline">YOUR WORKSPACE</span>
                <h2>Welcome back, {user?.name?.split(' ')[0]}<span className="accent">.</span>
                </h2>
                <p>Manage your {user?.role === 'client' ? 'projects and service requests' : 'services and opportunities'} in one place.</p>
                </div>
                <button className="primary" onClick={() => setModal({ type: user?.role === 'client' ? 'project' : 'service' })}>
                <Plus size={18}/> {user?.role === 'client' ? 'New project' : 'New service'}</button>
                </div>
                <div className="stats">
                <div>
                <span>My {user?.role === 'client' ? 'projects' : 'services'}</span>
                <strong>{dashboard?.projects ?? dashboard?.services ?? mine.length}</strong>
                <BriefcaseBusiness />
                </div>
                <div>
                <span>Project contracts</span>
                <strong>{contracts.length}</strong>
                <Layers />
                </div>
                <div>
                <span>Service orders</span>
                <strong>{orders.length}</strong>
                <Clock3 />
                </div>
                </div>
                <div className="stats">
                <div>
                <span>Active work</span>
                <strong>{dashboard?.active ?? 0}</strong>
                </div>
                <div>
                <span>Completed work</span>
                <strong>{dashboard?.completed ?? 0}</strong>
                </div>
                <div>
                <span>Completed contract value</span>
                <strong>{money(dashboard?.completedValue)}</strong>
                </div>
                </div>
                <h3 className="listtitle">My {user?.role === 'client' ? 'posted projects' : 'listed services'}</h3>{mine.length ? mine.map(x => <div className="row" key={x._id}>
                <div>
                <h4>{x.title}</h4>
                <p>{money(x.budget ?? x.price)} · {x.status || (x.active ? 'Active' : 'Hidden')}</p>
                </div>
                <div className="rowactions">{user?.role === 'client' ? <button className="outline" onClick={() => openProposals(x)}>View proposals</button> : <button className="outline" onClick={() => action(`/services/${x._id}/toggle`)}>{x.active ? 'Pause listing' : 'Activate listing'}</button>}</div>
                </div>) : <div className="empty">Nothing here yet. Create your first listing!</div>}</section> : <section className="shell inner">
                <span className="overline">WORK IN PROGRESS</span>
                <h2>My work<span className="accent">.</span>
                </h2>
                <p className="muted">Manage contracts and orders from start to finish.</p>{user?.role === 'freelancer' && <>
                <h3 className="listtitle">My proposals</h3>{(proposals.mine || []).map(p => <div className="row" key={p._id}>
                <div>
                <h4>{p.project?.title || 'Project'} <StatusBadge s={p.status}/>
                </h4>
                <p>Bid: {money(p.bid)}</p>
                </div>
                </div>)}</>}<h3 className="listtitle">Project contracts</h3>{contracts.length ? contracts.map(c => <div className="row" key={c._id}>
                <div>
                <h4>{c.project?.title} <StatusBadge s={c.status}/>
                </h4>
                <p>{money(c.price)} · {user?.role === 'client' ? c.freelancer?.name : c.client?.name}</p>{c.submission?.link && <p>
                <a href={c.submission.link} target="_blank" rel="noreferrer">View submitted work ↗</a> · {c.submission.note}</p>}{c.revisionNote && <p className="warning">Revision: {c.revisionNote}</p>}</div>
                <div className="rowactions">
                <button className="outline" onClick={() => { setMessageDraft(''); getConversation('contract', c); }}>Messages</button>{user?.role === 'client' && !isPaid('contract', c._id) && <button className="primary" disabled={payingKey !== null} onClick={() => payForWork('contract', c)}>{payingKey === `contract:${c._id}` ? 'Processing...' : 'Pay Now (Test)'}</button>}{isPaid('contract', c._id) && <span className="status completed">Paid (Test)</span>}{user?.role === 'client' && c.status === 'completed' && !reviews.some(x => x.contract === c._id) && <button className="outline" onClick={() => setModal({ type: 'review', mode: 'contract', item: c })}>Leave review</button>}{user?.role === 'freelancer' && ['in_progress', 'revision_requested'].includes(c.status) && <button className="primary" onClick={() => setModal({ type: 'submit', mode: 'contract', item: c })}>Submit work</button>}{user?.role === 'client' && c.status === 'submitted' && <>
                <button className="primary" onClick={() => action(`/contracts/${c._id}/review`, { approve: true })}>Approve</button>
                <button className="outline" onClick={() => setModal({ type: 'revision', mode: 'contract', item: c })}>Request changes</button>
                </>}</div>
                </div>) : <div className="empty compact">No project contracts yet.</div>}<h3 className="listtitle">Service orders</h3>{orders.length ? orders.map(o => <div className="row" key={o._id}>
                <div>
                <h4>{o.service?.title} <StatusBadge s={o.status}/>
                </h4>
                <p>{money(o.price)} · {user?.role === 'client' ? o.freelancer?.name : o.client?.name}</p>
                <p className="muted">Requirements: {o.requirements}</p>{o.submission?.link && <p>
                <a href={o.submission.link} target="_blank" rel="noreferrer">View submitted work ↗</a> · {o.submission.note}</p>}{o.revisionNote && <p className="warning">Revision: {o.revisionNote}</p>}</div>
                <div className="rowactions">
                <button className="outline" onClick={() => { setMessageDraft(''); getConversation('order', o); }}>Messages</button>{user?.role === 'client' && ['in_progress', 'submitted', 'revision_requested', 'completed'].includes(o.status) && !isPaid('order', o._id) && <button className="primary" disabled={payingKey !== null} onClick={() => payForWork('order', o)}>{payingKey === `order:${o._id}` ? 'Processing...' : 'Pay Now (Test)'}</button>}{isPaid('order', o._id) && <span className="status completed">Paid (Test)</span>}{user?.role === 'client' && o.status === 'completed' && !reviews.some(x => x.order === o._id) && <button className="outline" onClick={() => setModal({ type: 'review', mode: 'order', item: o })}>Leave review</button>}{user?.role === 'freelancer' && o.status === 'requested' && <>
                <button className="primary" onClick={() => action(`/orders/${o._id}/decision`, { accept: true })}>Accept</button>
                <button className="outline" onClick={() => action(`/orders/${o._id}/decision`, { accept: false })}>Decline</button>
                </>}{user?.role === 'freelancer' && ['in_progress', 'revision_requested'].includes(o.status) && <button className="primary" onClick={() => setModal({ type: 'submit', mode: 'order', item: o })}>Submit work</button>}{user?.role === 'client' && o.status === 'submitted' && <>
                <button className="primary" onClick={() => action(`/orders/${o._id}/review`, { approve: true })}>Approve</button>
                <button className="outline" onClick={() => setModal({ type: 'revision', mode: 'order', item: o })}>Request changes</button>
                </>}</div>
                </div>) : <div className="empty compact">No service orders yet.</div>}</section>}

    <footer>
                <div className="shell foot">
                <div className="brand">
                <span className="brandmark">
                <Layers size={18}/>
                </span>skill<span>bridge</span>
                </div>
                <p>Where great talent meets great ideas. Built with purpose.</p>
                <span>© 2026 SkillBridge</span>
                </div>
                </footer>

    {message && <div className="toast">{message}</div>}{modal && <div className="backdrop" onMouseDown={e => { if (e.target === e.currentTarget)
        setModal(null); }}>
                <div className="dialog">
                <button className="close" onClick={() => setModal(null)}>×</button>{modal.type === 'editprofile' ? <>
                <h2>Edit profile</h2>
                <form onSubmit={async (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.currentTarget)); v.skills = split(v.skills); try {
        const r = await api.patch('/auth/me', v);
        setUser(r.data.user);
        setModal(null);
        notify('Profile updated');
    }
    catch (ex) {
        notify(err(ex));
    } }}>
                <label>Bio<textarea name="bio" defaultValue={user?.bio}/>
                </label>
                <label>Skills (comma separated)<input name="skills" defaultValue={(user?.skills || []).join(', ')}/>
                </label>
                <label>Portfolio URL<input name="portfolio" type="url" defaultValue={user?.portfolio || ''}/>
                </label>
                <button className="primary full">Save profile</button>
                </form>
                </>
                : modal.type === 'profile' ? <>
                <h2>{modal.freelancer.name}</h2>
                <p>{modal.freelancer.bio || 'No bio yet.'}</p>
                <div className="tags">{(modal.freelancer.skills || []).map(x => <span key={x}>{x}</span>)}</div>{modal.freelancer.portfolio && <p>
                <a href={modal.freelancer.portfolio} target="_blank" rel="noreferrer">View portfolio ↗</a>
                </p>}<h3>Rating: {modal.average ?? 'No reviews yet'}</h3>{modal.reviews.map(x => <div className="proposal" key={x._id}>
                <b>{x.rating}/5 · {x.client?.name}</b>
                <p>{x.comment}</p>
                </div>)}</>
                : modal.type === 'review' ? <>
                <h2>Review completed work</h2>
                <form onSubmit={async (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)); await action('/reviews', { type: modal.mode, id: modal.item._id, rating: Number(f.rating), comment: f.comment }); }}>
                <label>Rating<select name="rating">{[5, 4, 3, 2, 1].map(x => <option key={x} value={x}>{x} stars</option>)}</select>
                </label>
                <label>Feedback<textarea name="comment" minLength="5" required/>
                </label>
                <button className="primary full">Submit review</button>
                </form>
                </>
                : modal.type === 'messages' ? <>
                <h2>Work messages</h2>
                <p className="muted">Messages are saved and visible only to the client and freelancer.</p>
                <div className="conversation">{modal.rows.length ? modal.rows.map(x => <div className="chatline" key={x._id}>
                <strong>{x.sender?.name}</strong>
                <p>{x.body}</p>
                <small>{new Date(x.createdAt).toLocaleString()}</small>
                </div>) : <p>No messages yet.</p>}</div>
                <form onSubmit={sendConversationMessage}>
                <label>New message<textarea name="body" value={messageDraft} onChange={e => setMessageDraft(e.target.value)} maxLength={2000} required/>
                </label>
                <button className="primary full" disabled={sendingMessage || !messageDraft.trim()}>{sendingMessage ? 'Sending...' : 'Send message'}</button>
                </form>
                <button className="outline full" onClick={() => getConversation(modal.mode, modal.item)}>Refresh messages</button>
                </>
                : modal.type === 'auth' ? <>
                <span className="overline">JOIN THE COMMUNITY</span>
                <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
                <p className="muted">{authMode === 'login' ? 'Log in to manage your work.' : 'Start building your next big thing.'}</p>
                <form onSubmit={auth}>{authMode === 'register' && <>
                <label>Full name<input name="name" minLength="2" required placeholder="Alex Morgan"/>
                </label>
                <label>I am a<select name="role">
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
                </select>
                </label>
                </>}<label>Email<input name="email" type="email" required placeholder="you@example.com"/>
                </label>
                <label>Password<input name="password" type="password" minLength="8" required placeholder="Minimum 8 characters"/>
                </label>
                <button className="primary full">{authMode === 'login' ? 'Log in' : 'Create account'} <ArrowRight size={17}/>
                </button>
                </form>
                <p className="authswitch">{authMode === 'login' ? "Don't have an account?" : "Already have an account?"} <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Sign up' : 'Log in'}</button>
                </p>
                </>
                : modal.type === 'project' ? <>
                <h2>Post a new project</h2>
                <p className="muted">Describe the work and find your ideal freelancer.</p>
                <form onSubmit={e => onSubmit(e, '/projects', ['budget'])}>
                <label>Project title<input name="title" required minLength="5" placeholder="Build a responsive landing page"/>
                </label>
                <label>Description<textarea name="description" required minLength="15" placeholder="Describe your project goals, deliverables, and expectations"/>
                </label>
                <label>Required skills (comma separated)<input name="skills" placeholder="React, Node.js, Figma"/>
                </label>
                <div className="formgrid">
                <label>Budget (₹)<input name="budget" type="number" min="1" required/>
                </label>
                <label>Deadline<input name="deadline" type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} required/>
                </label>
                </div>
                <button className="primary full">Publish project</button>
                </form>
                </>
                : modal.type === 'service' ? <>
                <h2>List a service</h2>
                <p className="muted">Turn your skills into a service clients can request.</p>
                <form onSubmit={e => onSubmit(e, '/services', ['price', 'deliveryDays'])}>
                <label>Service title<input name="title" required minLength="5" placeholder="I will build a React website"/>
                </label>
                <label>Description<textarea name="description" required minLength="15" placeholder="What will you deliver?"/>
                </label>
                <label>Category<input name="category" required placeholder="Web Development"/>
                </label>
                <label>Skills (comma separated)<input name="skills" placeholder="React, CSS"/>
                </label>
                <div className="formgrid">
                <label>Price (₹)<input name="price" type="number" min="1" required/>
                </label>
                <label>Delivery (days)<input name="deliveryDays" type="number" min="1" max="365" required/>
                </label>
                </div>
                <button className="primary full">Publish service</button>
                </form>
                </>
                : modal.type === 'apply' ? <>
                <h2>Send a proposal</h2>
                <p className="muted">{modal.item.title} · Budget {money(modal.item.budget)}</p>{user?.role !== 'freelancer' ? <p>Only freelancers can submit proposals. Register or log in as a freelancer.</p> : <form onSubmit={e => onSubmit(e, `/projects/${modal.item._id}/proposals`, ['bid'])}>
                <label>Your cover letter<textarea name="coverLetter" minLength="15" required placeholder="Explain why you're a great fit"/>
                </label>
                <label>Your bid (₹)<input name="bid" type="number" min="1" required/>
                </label>
                <button className="primary full">Submit proposal</button>
                </form>}</>
                : modal.type === 'order' ? <>
                <h2>Request this service</h2>
                <p className="muted">{modal.item.title} · {money(modal.item.price)}</p>{user?.role !== 'client' ? <p>Only clients can request services.</p> : <form onSubmit={e => onSubmit(e, `/services/${modal.item._id}/orders`)}>
                <label>Project requirements<textarea name="requirements" minLength="10" required placeholder="Tell the freelancer what you need"/>
                </label>
                <button className="primary full">Send request</button>
                </form>}</>
                : modal.type === 'proposals' ? <>
                <h2>Project proposals</h2>
                <p className="muted">{modal.project.title}</p>{modal.rows.length ? modal.rows.map(p => <div className="proposal" key={p._id}>
                <h4>{p.freelancer?.name} <StatusBadge s={p.status}/>
                </h4>
                <p>{p.coverLetter}</p>
                <p>
                <strong>{money(p.bid)}</strong> · {(p.freelancer?.skills || []).join(', ')}</p>{modal.project.status === 'open' && p.status === 'pending' && <button className="primary" onClick={() => action(`/proposals/${p._id}/accept`)}>Hire freelancer</button>}</div>) : <div className="empty compact">No proposals yet.</div>}</>
                : modal.type === 'submit' ? <>
                <h2>Submit completed work</h2>
                <form onSubmit={e => onSubmit(e, `/${modal.mode === 'order' ? 'orders' : 'contracts'}/${modal.item._id}/submit`)}>
                <label>Work URL<input name="link" type="url" required placeholder="https://github.com/..."/>
                </label>
                <label>Delivery notes<textarea name="note" minLength="5" required placeholder="What did you complete?"/>
                </label>
                <button className="primary full">Submit for review</button>
                </form>
                </>
                : modal.type === 'revision' ? <>
                <h2>Request changes</h2>
                <form onSubmit={e => { e.preventDefault(); action(`/${modal.mode === 'order' ? 'orders' : 'contracts'}/${modal.item._id}/review`, { approve: false, note: new FormData(e.currentTarget).get('note') }); }}>
                <label>Revision feedback<textarea name="note" minLength="5" required placeholder="What needs to be improved?"/>
                </label>
                <button className="primary full">Send feedback</button>
                </form>
                </> : null}</div>
                </div>}
        </>
    );
}
createRoot(document.getElementById('root')).render(<App />);
