# Milestone 1 Docs Revision 

## General Feedback

Overall, this is a solid milestone with good structure and effort across the board. There are a few minor issues to take care of before diving into `M2v1`, but nothing major at this point.

I want to highlight that Stella is doing a great job as team lead. She’s clearly organized and on top of things, and I think this team has a lot of potential. If you continue to stay focused, follow the guidelines closely, and pay attention to the details we discuss in class, I honestly think this team can end up at the top.

Most of the smaller issues here could have been easily caught by reviewing the lecture recordings or checking in with me during office hours. Those resources are always available, and I encourage you to make use of them as you move forward.

Additionally, please make sure to write meaningful commit messages. Avoid using placeholders or unclear comments like dfg, as they don’t provide any context for the changes made. Clear commit messages help everyone on the team stay organized and understand the history of the project.

## Main Page

- The date at the top looks like it didn’t render properly. Please fix the formatting.
- Consider adding visual separators between sections to improve the readability of your document.

## Executive Summary

Well done here. The product vision is clear, and the unique features are explained in a way that’s easy to follow.

## Main Use Cases

- The content in this section is strong.
- Just make sure that all diagrams follow a consistent format. Right now, it's clear different people worked on them, which is totally fine, but from a reader’s perspective, consistency across visuals makes a big difference.
- Try to align the style and layout of all diagrams so the section feels cohesive.

## List of Main Data Items and Entities

- This section is on the right track, but I’d like to see more entities added. Several important ones are mentioned in your use cases but don’t appear here.
- Also, some of the entities need a bit more context. For example, in one use case you refer to “accessible parking space,” but in the entities list, it’s just called “parking space.” For a reader unfamiliar with your app, it’s important to clarify the difference between accessible and non-accessible spaces and how that distinction plays out in your system.

## Initial List of Functional Requirements

This section needs to be completely redone due to several major issues:

1. The format does not follow what we covered in class. For example, instead of writing vague phrases like “Search by address, date, time,” you need to clearly separate the **Renter** and **Driver** roles into distinct entities and define functional requirements using the correct format:

   ### 1. Renter
   - 1.1 The renter shall be able to search [insert relevant entity] by address.
   - 1.2 The renter shall be able to search [insert relevant entity] by date.
   - 1.3 The renter shall be able to search [insert relevant entity] by time.

   ### 2. Driver
   - 2.1 The driver shall be able to [insert functional action].
   - 2.2 The driver shall be able to [insert functional action].
   - 2.3 The driver shall be able to [insert functional action].

   All requirements should describe a single, specific service or feature available to the user. We went over this structure in class and reviewed multiple examples.

2. Every entity listed earlier in your document must be associated with at least one functional requirement. If an entity has no role in system functionality, it should not be included in your list.

3. The current list is too short. You need to include more requirements to fully represent the features described in your Use Cases section.


## List of Non-Functional Requirements

There’s a good start here, but several important categories are missing. Be sure to include things like:

- **Coding Standards**: For example, will your team use tabs or spaces? What are your formatting rules?
- **Look and Feel**: Are there any style or design guidelines you plan to follow?
- **Privacy**: This should be addressed on its own, apart from general compliance requirements.

You’ll also want to be more specific in places. Under **Supportability**, for instance, include browser and OS support, like: “The system shall be supported by Safari browser version 11.1.1.”

Avoid limiting support to only the latest versions; most users won’t be fully up to date.

## Competitive Analysis

The second table looks great visually, but it needs to be revised to match the structure we discussed in class. Right now, it’s hard to tell which features you’re planning to implement or improve upon based on your research.

Please follow the standard table format:

- `-` = Not implemented  
- `+` = Implemented  
- `++` = You plan to improve it  

We covered this format in detail during lecture, and it’s also in the recording.

## Checklist

This section looks good.

I’ll just add that you’re always welcome to stop by my office hours. Teams that check in regularly tend to catch problems early and avoid major revisions later. Even a quick check-in per milestone can go a long way.

## List of Contributions

It looks like the scores are missing from this section. Please make sure to include them in the next version.

## Next Steps

1. Freeze `m1v1.pdf`. No more edits should be made. This version will serve as a snapshot of your work at this stage.
2. Create a revised version named `m1v2`, incorporating the feedback above.
3. Submit `m1v2` to the same folder once complete.
4. Start working on `m2v1`.

**Note:**  
`m1v2` is due on the same date as `m2v1`, but it’s a good idea to get it done earlier. Your work on `m2v1` will build directly on the revisions you make in `m1v2`.
