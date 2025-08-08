# General Feedback

Overall, this was a good milestone, but not your best one. For Milestone 5, I’d really like to see the return of the team that won Best Milestone 2. I know you’re capable of that level of work, and I want to see it again!

**Beta Prototype Grade**: I’m a bit torn here. Your prototype is genuinely one of the best in the class, great job on that! However, I do have concerns about individual contributions. It wouldn’t be fair to give a full 14/14 to everyone when it’s clear that some teammates carried more of the load.

Here’s what I think is a fair approach: I’m assigning a provisional grade of 14/14 to everyone for now, with a clear disclaimer regarding low contributions. For Fatma and El Juliana, this grade is temporary. If I don’t see a significant improvement in your contributions for the final version of the project, I will go back and deduct points from your Beta Prototype grade accordingly.
 
---

## Product Summary

- Excellent work! You clearly understood how to reframe specifications as business requirements — exactly what’s needed when communicating with investors and stakeholders.

## Usability Testing

- It looks like all the usability test plans are missing. I think there might’ve been a misunderstanding here. In class, we mentioned that five test plans were required — one per tested feature. Each plan should have incorporated the concepts from slide 17 of the usability testing slides.
- That said, the tables with test results are well-organized and clearly presented.

## QA Testing

- Same issue as above, one test plan per non-functional requirement was expected.

## Localization Testing

- Great work here! The tests are well thought out and clearly documented.
- However, you're missing one required test: the one that checks for cultural nuances in a language other than English.

## Code Review

- Nicely done overall. Just a small note: please make sure to name the person from the other team who reviewed your code. I happen to know it was Emily from Team 02 based on the username, but this should be made explicit in your submission.

## Contributions

- **Fatma and El Juliana**: I’m starting to see a pattern where your contributions are consistently low across milestones, which is concerning this late in the semester. I’d like both of you to email me directly to explain what’s been going on. Be honest, this isn’t about blame; it’s about understanding the situation and finding a path forward.

## Beta Prototype

- Make sure your home page links to the one with the “Find Parking...” message, not the login page. It may be that the link you shared points directly to sign-in, if so, please double-check it.
- If a user tries to book a parking spot without being logged in, after they log in or sign up, they should be redirected back to where they left off, don’t reset the flow.
- If a user doesn’t have a payment method saved, guide them with a link to account settings. Don’t leave them guessing where to go.
- It seems like adding new payment methods isn’t implemented yet. If it is, the UX needs improvement, I couldn’t figure out how to add one. I was able to edit an existing payment method, but not add a new one, even though my account showed two payment methods and the app still told me I had none.
- Saving changes to edited payment methods doesn’t appear to be working yet — please fix this in the next version.
- Remove all hardcoded data (e.g. bookings). Real users will be testing the beta, and seeing bookings they didn’t make will confuse them.
- The session expires far too quickly. I was logged out at least three times in under five minutes. Please increase the timeout to at least 10–15 minutes of inactivity.

---
