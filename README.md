# SkillBridge — Hybrid Freelance Marketplace

A full-stack MERN application combining **Upwork-style project bidding** with **Fiverr-style service listings**. Clients can post projects and hire freelancers through proposals, or request a freelancer's fixed-price service. Both paths include work delivery, client approval, and revision requests.

## Problem and target users

Small businesses and individual clients need a clear way to find freelance talent and manage deliverables. Freelancers need a place to discover project opportunities and offer packaged services. SkillBridge connects both sides with two distinct hiring workflows.

## Features (16 requested capabilities)

1. Authentication: registration, login, JWT, password hashing and client/freelancer roles.
2. Project marketplace: post, browse and search client projects.
3. Proposal system: submit bids, inspect proposals and hire a freelancer.
4. Service marketplace: freelancers publish fixed-price services; clients request them.
5. Contract/order management: work submission, approval, revisions and completion.
6. Freelancer profiles: skills, bio and portfolio links.
7. Dashboards: proposals, active/completed work and completed contract values.
8. Ratings and reviews: one review per completed contract or order.
9. Skill-based recommendations: ranked project matches using skill overlap.
10. Client/freelancer messaging: messages persisted in MongoDB, manually refreshed.
11. Budget-based filtering and sorting: min/max budgets and price order.
12. Skill-match percentages: percentage of required skills matching a freelancer profile.
13. Dashboard statistics: work counts, contract values and freelancer average ratings.
14. Profile editing: update bio, skills and portfolio link.
15. Persistent conversations: messages stored and retrieved for contracts/orders.
16. Authorization for reviews and conversations: participants only; only the owning client can review completed work.

### Scope and limitations

- Messaging is **not live WebSocket messaging**; users manually refresh conversations.
- No real payments, file storage or automatic email notifications.
- Skill matching uses deterministic overlap rather than an AI model.
- This is a source-code implementation; end-to-end verification against your own Atlas instance and deployment are still required.

## Tech stack

React + Vite, plain CSS, Axios, Lucide icons, Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, express-rate-limit.

## Architecture

```
client/src/main.jsx (React UI) ---> Axios ---> server/src/index.js (Express)
                                                  |
                                           routes/api.js
                                                  |
                                       middleware/auth.js
                                                  |
                                        models/index.js
                                                  |
                                              MongoDB
```

### Models

`User`, `Project`, `Proposal`, `Contract`, `Service`, `Order`, `Review`, `Message`. A proposal is unique per `(project, freelancer)`; a contract is unique per project and accepted proposal. Project hiring is performed in a MongoDB transaction to prevent concurrent double hires.

## Local setup

Requires Node.js 20+ and **MongoDB Atlas or a local MongoDB replica set**. Standalone local MongoDB is sufficient for most routes but **cannot perform the proposal-acceptance transaction**.

1. Create a MongoDB Atlas cluster (free tier is sufficient for development), configure its network access, and get a connection string.
2. In `server`, copy `.env.example` to `.env` and set `MONGO_URI`, a long random `JWT_SECRET`, and `CLIENT_URL`.
3. In `client`, copy `.env.example` to `.env` and set `VITE_API_URL`.
4. Run these commands in separate terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`. API health check: `http://localhost:8080/health`.

## Environment variables

| Location | Variable | Meaning |
|---|---|---|
| server | `MONGO_URI` | MongoDB connection string |
| server | `JWT_SECRET` | Secret string at least 32 characters |
| server | `PORT` | API port, defaults to 8080 |
| server | `CLIENT_URL` | Allowed frontend origin; comma-separated origins supported |
| client | `VITE_API_URL` | Public API base URL, ending with `/api` |

**Never commit `.env` or credentials.** Use production environment variable settings on the hosting platforms.

## Deployment

- Backend: deploy `server/` as a Node service on Render, with build command `npm install`, start command `npm start`, and the server environment variables configured.
- Frontend: deploy `client/` to Vercel with build command `npm run build`, output directory `dist`, and `VITE_API_URL=https://YOUR-BACKEND/api`.
- Set backend `CLIENT_URL=https://YOUR-FRONTEND` and ensure MongoDB Atlas allows connections from the backend. Use HTTPS in production.
- Verify `/health`, registration, and both end-to-end workflows on the **deployed** URLs before submission.

**Deployment links:** Not deployed yet; replace this note with real links after deployment.

## Demo script (3–5 minutes)

1. Register a client account and post a project.
2. Register a freelancer account and send a proposal.
3. Return to the client account and hire that freelancer.
4. As freelancer, submit a work link; as client, approve it.
5. As freelancer, list a service; as client, request it.
6. Accept the request, submit the work, and request a revision or approve.
7. Briefly show backend validation/authorization and the responsive dashboard.

## Testing checklist

- [ ] Register both roles; login; invalid password rejected.
- [ ] Freelancer cannot post projects; client cannot create services.
- [ ] Duplicate proposals rejected.
- [ ] Only project owner can view and accept proposals.
- [ ] One accepted proposal per project; other proposals rejected.
- [ ] Freelancer submits work; client approves or requests changes.
- [ ] Client requests service; freelancer accepts or declines; submission/approval works.
- [ ] Refresh browser and confirm data persists.
- [ ] Verify deployed frontend/backend from an incognito window.

## Submission

Fill in project name, student name, problem statement, repository URL, deployment URL, demo video, stack, and major features in the official form. This code package is a starting application, **not an already deployed or submitted project**.

## Version 2 additions (10-feature upgrade)

The marketplace now includes authentication, project discovery and filtering, proposals and hiring, freelancer service listings and orders, contract submission/revisions, editable freelancer profiles, dashboard metrics, client ratings/reviews, skill-match project recommendations, and persistent work-specific messaging.

### New routes
- `GET /api/dashboard` — role-specific counts, active/completed work and completed contract value (not real payments).
- `GET /api/recommendations` — projects ranked by overlap with the signed-in freelancer's skills.
- `GET /api/freelancers/:id` — public profile and reviews; `GET /api/freelancers` — directory.
- `POST /api/reviews`, `GET /api/reviews/mine` — one client review per completed contract or order.
- `GET/POST /api/messages/:type/:id` — persistent messages for contract/order participants only. Messaging uses manual refresh, **not WebSockets**.
- `PATCH /api/auth/me` — bio, skills, portfolio URL.
- `GET /api/projects` and `GET /api/services` — search, price bounds and sort; projects also support skill filtering.

### Important testing notes
Run `npm install` inside both `server` and `client`. Keep `server/.env` local; never commit credentials. Test both roles with separate accounts, hiring, orders, revisions, reviews, recommendations and messaging. No payment processing is implemented. This release has static checks but **has not been end-to-end tested against your MongoDB Atlas instance or deployed**.


## Marketplace search and filter controls (V4)
- Search results refresh automatically 250 ms after the user stops typing; no Search click is required.
- Skill, minimum/maximum budget, and sort are draft inputs until **Apply filters** is clicked.
- **Apply filters** and **Remove filters** are dimmed/disabled when no draft or applied filters exist.
- **Remove filters** resets all inputs and applied filters to defaults, including recommendation mode.
- Test both Projects and Services with a keyword, apply a budget range, then remove filters.


## V5: Live skill search
- The skill field automatically applies after a 250ms debounce; the Apply Filters button remains available for budget and sorting choices.
- Skill matching is case-insensitive and matches partial skill names (e.g., `node`, `node.js`, and `Node.js` all match the stored `Node.js` skill).
- Remove Filters clears the skill search, budget and sorting selections.
- Skill matching happens on the server using an escaped MongoDB regular expression.


## Razorpay test payments (V6)

1. In the Razorpay Dashboard, switch to **Test Mode** and generate Test API keys.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`. Never commit that file.
3. Run `npm install` in **both** `server` and `client` after extracting the ZIP.
4. Log in as client, accept a project proposal (or have a freelancer accept a service request), then open **My work → Pay Now (Test)**.
5. Complete a simulated Razorpay checkout. The backend checks the HMAC signature, fetches the payment, and confirms it is captured with the correct order, amount and currency.
6. Payment records are persisted in MongoDB and visible to both participants as `Paid (Test)`; freelancers must wait for payment before submitting work.

This is **not escrow**, does not transfer money to freelancers, and is **not production-ready**. A real marketplace needs payout/settlement workflows, webhooks with raw-body signature validation, robust retry/idempotency and reconciliation, and additional testing. Existing projects and service listings persist if you use the same MongoDB URI.


## V7 payment button state fix

Only the Pay Now button for the currently processing contract/order displays **Processing...**. Other payment buttons retain their labels and are temporarily disabled to prevent duplicate concurrent checkouts. The state is reset after success, failure, or checkout cancellation.


### V8 message composer fix
After a message is successfully sent, the message input is cleared automatically. On send failure, the typed text remains available to retry.

## V9 readability and message composer fix
- JavaScript and JSX sources have been reformatted with consistent indentation and line breaks.
- Work messages now use a controlled draft input, clear only after a successful send, and disable the Send button while submitting.
- If sending fails, the draft remains available for retry.


## V10: Modular, readable source code

Frontend folders:
- `client/src/components/` — reusable marketplace card and status badge
- `client/src/hooks/usePayments.js` — Razorpay checkout and payment state
- `client/src/hooks/useMessages.js` — message submission, draft clearing and conversation loading
- `client/src/lib/` — API client and formatting helpers
- `client/src/main.jsx` — application layout and page workflows

Backend folders:
- `server/src/routes/modules/` — separate auth, projects, proposals, contracts, services, orders, freelancers, dashboard, reviews, messages and payments route modules
- `server/src/routes/helpers.js` — shared validation and request helpers
- `server/src/routes/api.js` — registers each feature's routes

Use `npm install` separately in `server` and `client`. Copy your existing working `server/.env` into the extracted project (the ZIP intentionally excludes credentials).


## Final submission checks

1. Copy `server/.env.example` to `server/.env`, then configure `MONGO_URI`, a `JWT_SECRET` of at least 32 characters, and optional Razorpay **test** keys. Never commit `.env`.
2. In `server/`, run `npm install && npm run dev`. Confirm `/health` responds successfully. If port 8080 is in use, stop the other server.
3. In `client/`, run `npm install && npm run build` and then `npm run dev`.
4. Test client registration, project creation, freelancer proposal, proposal acceptance, test payment, messages, service ordering, delivery, and review using two accounts.
5. Verify desktop and mobile layout, empty results, invalid inputs, unauthorized actions, and failed payments.
6. Before pushing to GitHub, run `git status --ignored` and ensure `.env`, credentials, `node_modules`, and `dist` are excluded.

**Note:** A Razorpay test checkout does not transfer funds to freelancers or implement escrow.
