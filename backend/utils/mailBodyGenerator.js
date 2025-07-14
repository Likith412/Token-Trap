function generateSuccessMailBody(org, results, scanId) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
    <h2 style="color: #2c3e50;">🔍 GitHub Organization Scan Completed</h2>

    <p>Hello,</p>

    <p>
      The scan for the GitHub organization <strong style="color: #3498db;">${org}</strong> has successfully completed.
      Below is a quick summary of the results:
    </p>

    <table style="border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">📁 Organization Results:</td>
        <td style="padding: 8px;">${results.orgResults.length}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">👤 User Results:</td>
        <td style="padding: 8px;">${results.userResults.length}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">🕒 Completed At:</td>
        <td style="padding: 8px;">${new Date().toLocaleString()}</td>
      </tr>
    </table>

    <p>
      You can now view the full scan report by clicking the button below:
    </p>

    <a href="https://tokentrap.xyz/scans/${scanId}" style="display: inline-block; padding: 12px 20px; margin-top: 10px;
      background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
      📄 View Full Report
    </a>

    <hr style="margin: 30px 0;" />

    <p style="font-size: 14px; color: #666;">
      This is an automated message sent by the <strong>TokenTrap Scanner</strong>.<br/>
      If you did not initiate this scan or believe this was an error, please contact support.
    </p>
  </div>
`;
}

function generateFailureMailBody(org) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
    <h2 style="color: #2c3e50;">🔍 GitHub Organization Scan Failed</h2>

    <p>Hello,</p>

    <p>
      The scan for the GitHub organization <strong style="color: #3498db;">${org}</strong> has failed.
      Please try again later.
    </p>

    <hr style="margin: 30px 0;" />

    <p style="font-size: 14px; color: #666;">
      This is an automated message sent by the <strong>TokenTrap Scanner</strong>.<br/>
      If you did not initiate this scan or believe this was an error, please contact support.
    </p>
  </div>
`;
}

function generateCancelledMailBody(org) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
    <h2 style="color: #2c3e50;">🔍 GitHub Organization Scan Cancelled</h2>

    <p>Hello,</p>

    <p>
      The scan for the GitHub organization <strong style="color: #3498db;">${org}</strong> was cancelled.
    </p>

    <hr style="margin: 30px 0;" />

    <p style="font-size: 14px; color: #666;">
      This is an automated message sent by the <strong>TokenTrap Scanner</strong>.<br/>
      If you did not initiate this scan or believe this was an error, please contact support.
    </p>
  </div>
  `;
}

module.exports = {
  generateSuccessMailBody,
  generateFailureMailBody,
  generateCancelledMailBody,
};
