interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[Email] To: ${options.to} | Subject: ${options.subject}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  async sendSignatureRequest(
    to: string,
    documentTitle: string,
    senderName: string,
    signingLink: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Signature Request: ${documentTitle}`,
      html: this.signatureRequestTemplate(documentTitle, senderName, signingLink),
    });
  }

  async sendContractInvitation(
    to: string,
    contractTitle: string,
    senderName: string,
    signingLink: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Contract Invitation: ${contractTitle}`,
      html: this.contractInvitationTemplate(contractTitle, senderName, signingLink),
    });
  }

  async sendReceipt(
    to: string,
    _receiptId: string,
    receiptNo: string,
    total: string,
    verifyLink: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Your Receipt: ${receiptNo}`,
      html: this.receiptTemplate(receiptNo, total, verifyLink),
    });
  }

  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: "Password Reset Request",
      html: this.passwordResetTemplate(resetLink),
    });
  }

  private signatureRequestTemplate(
    documentTitle: string,
    senderName: string,
    signingLink: string
  ): string {
    return `
      <div style="background:#050d1a;color:#f0f6ff;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.15);border-radius:16px;">
        <h2 style="font-family:Syne,sans-serif;color:#00d4ff;margin-bottom:24px;">TRUST<span style="color:#f0f6ff;">CHAIN</span></h2>
        <h3 style="color:#f0f6ff;margin-bottom:16px;">You've Been Invited to Sign</h3>
        <p style="color:#8aa0c0;line-height:1.6;"><strong style="color:#f0f6ff;">${senderName}</strong> has requested your signature on <strong style="color:#f0f6ff;">${documentTitle}</strong>.</p>
        <div style="margin:32px 0;text-align:center;">
          <a href="${signingLink}" style="background:#00d4ff;color:#050d1a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Sign Document</a>
        </div>
        <p style="color:#5a7098;font-size:12px;">This link is unique to you. Do not share it with others. Expires in 7 days.</p>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(0,212,255,0.08);color:#5a7098;font-size:12px;">
          Secured by TrustChain Protocol. Immutable. Verifiable. Forever.
        </div>
      </div>
    `;
  }

  private contractInvitationTemplate(
    contractTitle: string,
    senderName: string,
    signingLink: string
  ): string {
    return `
      <div style="background:#050d1a;color:#f0f6ff;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.15);border-radius:16px;">
        <h2 style="font-family:Syne,sans-serif;color:#00d4ff;margin-bottom:24px;">TRUST<span style="color:#f0f6ff;">CHAIN</span></h2>
        <h3 style="color:#f0f6ff;margin-bottom:16px;">Contract Invitation</h3>
        <p style="color:#8aa0c0;line-height:1.6;"><strong style="color:#f0f6ff;">${senderName}</strong> has invited you to review and sign <strong style="color:#f0f6ff;">${contractTitle}</strong>.</p>
        <div style="margin:32px 0;text-align:center;">
          <a href="${signingLink}" style="background:#00d4ff;color:#050d1a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Review Contract</a>
        </div>
        <p style="color:#5a7098;font-size:12px;">This is a secure blockchain-backed contract. Your signature will be permanently recorded.</p>
      </div>
    `;
  }

  private receiptTemplate(
    receiptNo: string,
    total: string,
    verifyLink: string
  ): string {
    return `
      <div style="background:#050d1a;color:#f0f6ff;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.15);border-radius:16px;">
        <h2 style="font-family:Syne,sans-serif;color:#00d4ff;margin-bottom:24px;">TRUST<span style="color:#f0f6ff;">CHAIN</span></h2>
        <h3 style="color:#f0f6ff;margin-bottom:16px;">Your Receipt</h3>
        <p style="color:#8aa0c0;line-height:1.6;">Receipt <strong style="color:#f0f6ff;">${receiptNo}</strong> has been issued.</p>
        <p style="color:#f0f6ff;font-size:24px;font-weight:700;margin:16px 0;">${total}</p>
        <div style="margin:32px 0;text-align:center;">
          <a href="${verifyLink}" style="background:#00d4ff;color:#050d1a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Verify Receipt</a>
        </div>
        <p style="color:#5a7098;font-size:12px;">This receipt is permanently anchored to the blockchain.</p>
      </div>
    `;
  }

  private passwordResetTemplate(resetLink: string): string {
    return `
      <div style="background:#050d1a;color:#f0f6ff;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.15);border-radius:16px;">
        <h2 style="font-family:Syne,sans-serif;color:#00d4ff;margin-bottom:24px;">TRUST<span style="color:#f0f6ff;">CHAIN</span></h2>
        <h3 style="color:#f0f6ff;margin-bottom:16px;">Password Reset</h3>
        <p style="color:#8aa0c0;line-height:1.6;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="margin:32px 0;text-align:center;">
          <a href="${resetLink}" style="background:#00d4ff;color:#050d1a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset Password</a>
        </div>
        <p style="color:#5a7098;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  }
}

export default new EmailService();
