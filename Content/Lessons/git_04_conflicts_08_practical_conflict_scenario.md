---
type: lesson
title: "A Practical Conflict Scenario"
description: "Walk through a complete, realistic merge conflict from start to finish — trigger the conflict, identify all affected files, resolve each one, and commit the merge."
duration_minutes: 18
difficulty: Intermediate
tags: [git, conflicts, resolution, walkthrough, practical]
---

> Learning conflict resolution from theory is one thing. Resolving one from start to finish — with real code and real decisions — is where the skill becomes yours.

## Why This Matters

This lesson synthesizes everything from Unit 04 into a single end-to-end scenario. By walking through a realistic conflict — one that a junior developer would encounter in their first week on a team — you'll have a mental model to reach for the next time conflicts appear.

## The Scenario

You're on a team building an e-commerce site. You've been working on the `feature/checkout-flow` branch. A teammate merged a payment API update directly into `main` while you were working. Now you need to bring `main` into your feature branch before opening a pull request.

```bash
# Confirm you're on your feature branch
git switch feature/checkout-flow
git log --oneline -3
```

```
a1b2c3d (HEAD -> feature/checkout-flow) Add order summary component
e3f4a5b Add checkout form validation
d2c3b4a Create checkout route
```

## Step 1: Update Your View of `main`

```bash
git fetch origin
git log origin/main --oneline -3
```

```
f0e1d2c (origin/main) Integrate Stripe payment API
c9b8a7a Add cart persistence
3a2b1c0 Initial project setup
```

The remote `main` now has "Integrate Stripe payment API" — a change your branch doesn't have. Time to merge it in.

## Step 2: Start the Merge

```bash
git merge origin/main
```

```
Auto-merging checkout.js
CONFLICT (content): Merge conflict in checkout.js
Auto-merging order.js
Merge made by the 'ort' strategy.
 order.js | 12 ++++++++++++
 1 file changed, 12 insertions(+)
```

`order.js` merged cleanly. `checkout.js` has a conflict.

## Step 3: Identify All Conflicts

```bash
git status
```

```
On branch feature/checkout-flow
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
        both modified:   checkout.js

Changes to be committed:
        modified:   order.js
```

One file to resolve: `checkout.js`. `order.js` is already staged.

## Step 4: Open the Conflicted File

```bash
cat checkout.js
```

```js
import { validateForm } from './validation';
import { CartStore } from './cart';

<<<<<<< HEAD
// Checkout flow: capture order details before payment
async function submitOrder(formData) {
  const errors = validateForm(formData);
  if (errors.length > 0) return { success: false, errors };
  const order = await CartStore.createOrder(formData);
  return { success: true, orderId: order.id };
}
=======
// Checkout flow: submit to Stripe payment processor
async function submitOrder(formData) {
  const errors = validateForm(formData);
  if (errors.length > 0) return { success: false, errors };
  const paymentIntent = await stripe.createPaymentIntent({
    amount: CartStore.total(),
    currency: 'cad',
  });
  return { success: true, paymentIntentId: paymentIntent.id };
}
>>>>>>> origin/main

export { submitOrder };
```

Reading the conflict:
- **HEAD** (`feature/checkout-flow`): creates an order in the CartStore
- **`origin/main`**: creates a Stripe payment intent

Both branches extended the same `submitOrder` function with different logic for what happens after validation. Neither version is wrong — they need to be **combined**: validate the form, then create the order, then create the Stripe payment intent to tie them together.

## Step 5: Resolve the Conflict

Edit `checkout.js` to produce the combined, correct result:

```js
import { validateForm } from './validation';
import { CartStore } from './cart';

// Checkout flow: validate, create order, and initiate payment
async function submitOrder(formData) {
  const errors = validateForm(formData);
  if (errors.length > 0) return { success: false, errors };

  // Create the order record first (from feature/checkout-flow)
  const order = await CartStore.createOrder(formData);

  // Then initiate payment (from main's Stripe integration)
  const paymentIntent = await stripe.createPaymentIntent({
    amount: CartStore.total(),
    currency: 'cad',
    metadata: { orderId: order.id },
  });

  return {
    success: true,
    orderId: order.id,
    paymentIntentId: paymentIntent.id,
  };
}

export { submitOrder };
```

Note: the resolution goes beyond "keep one side" — you combined both sides' logic and added `metadata: { orderId: order.id }` to link the payment intent to the order. This is what a real conflict resolution looks like.

## Step 6: Verify No Markers Remain

```bash
grep -n "<<<<<<" checkout.js
# (no output — clean)
```

## Step 7: Stage and Commit

```bash
git add checkout.js
git status
```

```
On branch feature/checkout-flow
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
        modified:   checkout.js
        modified:   order.js
```

```bash
git commit -m "Merge origin/main into checkout flow

Combined Stripe payment integration (from main) with order creation
logic (from feature branch). submitOrder now creates an order record
before initiating the Stripe payment intent, linking them via metadata."
```

## Step 8: Verify the Result

```bash
git log --oneline --graph -6
```

```
*   9c8b7a6 (HEAD -> feature/checkout-flow) Merge origin/main
|\
| * f0e1d2c (origin/main) Integrate Stripe payment API
| * c9b8a7a Add cart persistence
* | a1b2c3d Add order summary component
* | e3f4a5b Add checkout form validation
|/
* d2c3b4a Create checkout route
```

The merge commit `9c8b7a6` shows the diamond shape — `main`'s Stripe work has been integrated into your feature branch. Your PR can now be opened knowing it's up to date with `main`.

<ProgressCheck>
Create this scenario yourself: make two branches, both modify the same function in different ways, and resolve the resulting conflict by combining both approaches. Review `git log --graph` after completing the merge to confirm the diamond shape.
</ProgressCheck>

## Key Takeaways From This Scenario

- `git fetch` before merging so you know what's coming
- `git status` immediately after a conflict tells you exactly what to work on
- Start with `git diff` or just read the file to understand BOTH sides before deciding
- The resolution may be "keep one" or "combine intelligently" — decide based on intent, not just content
- Stage with `git add` after resolving each file
- Write a meaningful merge commit message explaining the resolution decisions

## Summary

A complete conflict resolution cycle: fetch → merge → read `git status` → open conflicted files → understand both sides → write combined result → remove all markers → `git add` → `git commit`. The editorial decision is the hard part; the Git commands are straightforward. Keep your merge commit messages informative — they're the documentation for future developers trying to understand why the code looks the way it does.

## Related

- [Reading Conflict Markers](/learn/git_foundations/git_04_conflicts_02_conflict_markers)
- [Manual Conflict Resolution](/learn/git_foundations/git_04_conflicts_04_manual_conflict_resolution)
- [The GitHub Collaboration Workflow](/learn/git_foundations/git_03_remotes_08_github_workflow)
