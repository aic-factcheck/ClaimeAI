// content.js
console.log("Fact-Checker ChatGPT Extension content script loaded.");

function addFloatingButtonToMessage(assistantMessageDiv) {
  const messageTurnRoot = assistantMessageDiv.closest(
    ".group.conversation-turn"
  );
  if (messageTurnRoot?.querySelector(".fact-checker-btn")) {
    return;
  }

  const button = document.createElement("button");
  button.innerText = "Check Fact";
  button.className = "fact-checker-btn";

  button.onclick = () => {
    // Extract Assistant's Text
    const assistantMarkdownContent =
      assistantMessageDiv.querySelector(".markdown.prose");
    let assistantText = "";
    if (assistantMarkdownContent) {
      assistantText =
        assistantMarkdownContent.innerText ||
        assistantMarkdownContent.textContent;
    } else {
      assistantText =
        assistantMessageDiv.innerText || assistantMessageDiv.textContent;
      console.warn(
        "Could not find '.markdown.prose' in assistant message, falling back to full message content:",
        assistantMessageDiv
      );
    }

    // Extract last User's Text
    let userText = "(User prompt not found)"; // Default if not found
    const currentArticle = assistantMessageDiv.closest(
      'article[data-testid^="conversation-turn-"]'
    );
    if (currentArticle) {
      const previousArticle = currentArticle.previousElementSibling;
      if (
        previousArticle?.matches('article[data-testid^="conversation-turn-"]')
      ) {
        const userMessageDiv = previousArticle.querySelector(
          'div[data-message-author-role="user"]'
        );
        if (userMessageDiv) {
          // ChatGPT user message text is often in a div with class like .whitespace-pre-wrap or similar
          const userTextContentDiv = userMessageDiv.querySelector(
            'div[class*="whitespace-pre-wrap"]'
          );
          if (userTextContentDiv) {
            userText =
              userTextContentDiv.innerText || userTextContentDiv.textContent;
          } else {
            // Fallback if specific text div isn't found, take whole user message div text
            userText = userMessageDiv.innerText || userMessageDiv.textContent;
            console.warn(
              "Could not find specific text content div in user message, using full user div text.",
              userMessageDiv
            );
          }
        }
      }
    }

    if (assistantText) {
      const encodedAssistantText = encodeURIComponent(assistantText.trim());
      const encodedUserText = encodeURIComponent(userText.trim());
      const redirectUrl = `http://localhost:3000/?q=${encodedUserText}&a=${encodedAssistantText}`;
      window.open(redirectUrl, "_blank");
    } else {
      console.error(
        "Could not extract assistant's text from message:",
        assistantMessageDiv
      );
    }
  };

  let actionsToolbarEl = null;
  const messageBlockParent = assistantMessageDiv.closest(
    ".relative.flex-col.gap-1"
  );
  if (messageBlockParent) {
    actionsToolbarEl = messageBlockParent.querySelector(".flex.justify-start");
  }

  if (actionsToolbarEl) {
    actionsToolbarEl.appendChild(button);
    console.log(
      "Fact-checker button added to actions toolbar:",
      actionsToolbarEl
    );
  } else {
    console.warn(
      "Could not find specific actions toolbar, appending button directly to message element (fallback).",
      assistantMessageDiv
    );
    assistantMessageDiv.appendChild(button);
  }
  console.log(
    "Fact-checker button added to (or attempted for):",
    assistantMessageDiv
  );
}

function processAssistantMessage(assistantMessageDiv) {
  const messageTurnRoot = assistantMessageDiv.closest(
    ".group.conversation-turn"
  );
  if (messageTurnRoot?.querySelector(".fact-checker-btn")) {
    // Button already exists for this message turn
    return;
  }

  const markdownDiv = assistantMessageDiv.querySelector(".markdown.prose");

  if (markdownDiv) {
    if (!markdownDiv.classList.contains("streaming-animation")) {
      console.log("Message complete, adding button:", assistantMessageDiv);
      addFloatingButtonToMessage(assistantMessageDiv);
    } else {
      console.log("Message streaming, observing for completion:", markdownDiv);
      const streamingObserver = new MutationObserver(
        (mutationsList, observer) => {
          for (const mutation of mutationsList) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              if (!mutation.target.classList.contains("streaming-animation")) {
                console.log(
                  "Streaming finished, adding button:",
                  assistantMessageDiv
                );
                addFloatingButtonToMessage(assistantMessageDiv);
                observer.disconnect();
                break;
              }
            }
          }
        }
      );
      streamingObserver.observe(markdownDiv, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  } else {
    console.warn(
      "Could not find '.markdown.prose' child in assistant message for streaming check:",
      assistantMessageDiv
    );
    addFloatingButtonToMessage(assistantMessageDiv);
  }
}

function observeOverallMessages() {
  const assistantMessageSelector = 'div[data-message-author-role="assistant"]';

  const mainObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches(assistantMessageSelector)) {
            processAssistantMessage(node);
          }
          node
            .querySelectorAll(assistantMessageSelector)
            .forEach(processAssistantMessage);
        }
      }
    }
  });

  mainObserver.observe(document.body, { childList: true, subtree: true });
  document
    .querySelectorAll(assistantMessageSelector)
    .forEach(processAssistantMessage);
}

observeOverallMessages();
