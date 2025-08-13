const faqAnswers = {
  "What are the current sales trends?": "Our current sales trends show a 15% increase in Q3, driven by strong performance in the North American market.",
  "Generate a report on Q3 performance.": "The Q3 performance report is being generated and will be sent to your email shortly.",
  "Summarize the latest market analysis.": "The latest market analysis indicates a growing demand for sustainable products, with a projected market growth of 20% in the next year.",
  "What are our top-selling products?": "Our top-selling products in Q3 were the 'Eco-Friendly Water Bottle' and the 'Smart Home Hub'.",
  "Show me the history of incident XYZ.": "Incident XYZ was reported on 2023-10-26, and it was resolved on 2023-10-27. The root cause was a memory leak in the web server.",
  "What was the resolution for ticket #12345?": "Ticket #12345 was resolved by applying patch v1.2.3 to the affected server. The user has confirmed the issue is resolved.",
  "Who was assigned to the last critical incident?": "The last critical incident was assigned to Jane Doe, our on-call Site Reliability Engineer.",
  "List all incidents from the past week.": "There have been 3 incidents in the past week: a minor database outage, a failed deployment, and a security alert. All have been resolved.",
  "Find articles related to \"database connection issues\".": "I have found 5 articles related to database connection issues in the KEDB. The most relevant one is 'Troubleshooting Common Database Connection Errors'.",
  "What is the standard procedure for a password reset?": "The standard procedure for a password reset is to use the self-service portal. If that fails, please contact the IT help desk.",
  "Show me the KEDB entry for \"firewall configuration\".": "The KEDB entry for 'firewall configuration' outlines the standard rules for our production environment. It was last updated 2 weeks ago.",
  "Who is the SME for network infrastructure?": "The Subject Matter Expert for network infrastructure is John Smith. He can be reached at jsmith@example.com.",
  "What is the current status of the data warehouse ETL job?": "The data warehouse ETL job is currently running and is 75% complete. The estimated time of completion is 3:00 AM UTC.",
  "Show me the schema for the \"sales\" table.": "The schema for the 'sales' table includes the following columns: 'order_id', 'product_id', 'customer_id', 'sale_date', and 'amount'.",
  "Who has access to the BI reporting dashboard?": "The BI reporting dashboard is accessible to all members of the 'Data Science' and 'Executive' user groups.",
  "What are the dependencies for the \"marketing\" data model?": "The 'marketing' data model depends on the 'customer' and 'sales' data models. The data is refreshed daily at 4:00 AM UTC.",
  "Run a cohort analysis on user engagement.": "The cohort analysis on user engagement shows that users who sign up in the first week of the month have a 20% higher retention rate.",
  "What is the correlation between ad spend and conversions?": "There is a strong positive correlation of 0.85 between ad spend and conversions. I can generate a detailed report if you'd like.",
  "Show me a time series forecast for user growth.": "The time series forecast for user growth projects a 10% increase in active users over the next 6 months.",
  "What are the key drivers of customer churn?": "The key drivers of customer churn are poor customer service and a lack of new features. We are working on improving both.",
  "What is the SLA for a P1 incident?": "The SLA for a P1 incident is a 15-minute response time and a 4-hour resolution time.",
  "What are the steps to troubleshoot a \"login issue\"?": "The first step to troubleshoot a login issue is to clear the browser cache and cookies. If that doesn't work, try resetting the password.",
  "Show me the on-call schedule for this week.": "The on-call engineer for this week is Michael Johnson. He can be reached at mjohnson@example.com.",
  "What is the escalation path for a security incident?": "The escalation path for a security incident is to immediately notify the on-call security engineer and the Head of Information Security.",
};

const defaultResponse = "I am a demo LLM and have a limited set of pre-programmed responses. For any other questions, I can only provide this static message.";

export const getLlmResponse = (prompt) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const answer = faqAnswers[prompt] || defaultResponse;
      resolve(answer);
    }, 1500); // Simulate network delay
  });
}; 