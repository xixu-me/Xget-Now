# Privacy Policy for Xget for Chrome

## Last updated: July 9, 2025

## Overview

Xget for Chrome is a browser extension that accelerates downloads by redirecting them through Xget proxy servers. This privacy policy explains how we collect, use, and protect your information when you use our extension.

## Information We Collect

### 1. User Settings and Configuration Data

We collect and store the following information locally on your device:

- **Xget Domain Configuration**: The domain you configure for the Xget service (e.g., "xget.xi-xu.me")
- **Extension Enable/Disable Status**: Whether the extension is currently enabled
- **Platform Preferences**: Your preferences for which platforms (GitHub, GitLab, Hugging Face) to use with the extension

### 2. Download Activity Data

The extension processes the following data during operation:

- **Download URLs**: URLs of files you attempt to download from supported platforms
- **Referrer Information**: The webpage from which downloads are initiated
- **File Information**: Basic file metadata like filenames when available

### 3. Browser Interaction Data

- **Tab Information**: Limited tab data to send notifications about redirected downloads
- **Click Events**: Detection of clicks on download links to trigger redirection

## How We Use Your Information

### Local Processing Only

- All settings and preferences are stored locally in your browser using Chrome's storage API
- Download URL transformation happens locally within the extension
- No personal data is transmitted to our servers

### Download Redirection

- We modify download URLs to redirect through your configured Xget domain
- The original download URLs are processed locally to create Xget-compatible URLs
- Redirected downloads are handled by the Xget service according to their privacy policy

### Notifications

- We display local notifications to inform you when downloads are redirected
- These notifications appear only in your browser and are not logged or transmitted

## Data Storage and Security

### Local Storage

- All extension settings are stored using Chrome's synchronized storage API
- Settings may sync across your Chrome browsers if you're signed into Chrome
- No sensitive personal information is stored

### Data Retention

- Settings persist until you uninstall the extension or manually clear them
- Download URLs are not stored; they are processed in real-time only
- No browsing history or personal files are retained

### Security Measures

- All data processing occurs locally within your browser
- No external communication except for redirected downloads through your configured Xget domain
- Extension follows Chrome's security model and permissions system

## Third-Party Services

### Xget Service

- When you download files, they are redirected through the Xget service you configure
- The Xget service may have its own privacy policy governing how they handle downloads
- We recommend reviewing the privacy policy of your chosen Xget service provider

### Supported Platforms

The extension operates on these platforms:

- **GitHub** (github.com)
- **GitLab** (gitlab.com)
- **Hugging Face** (huggingface.co)

We do not collect or store any account information from these platforms.

## Permissions Explained

### Why We Need These Permissions

**Downloads Permission**:

- Required to intercept and redirect download requests
- Allows the extension to cancel original downloads and start redirected ones

**Storage Permission**:

- Used to save your extension settings and preferences locally
- Enables settings synchronization across your Chrome browsers

**Active Tab Permission**:

- Needed to send notifications about redirected downloads
- Does not allow reading page content or personal information

**Host Permissions** (github.com, gitlab.com, huggingface.co):

- Required to run the extension on supported platforms
- Allows detection and redirection of download links

**Web Request Permissions**:

- Used for download interception functionality
- Does not monitor general browsing activity

## Your Privacy Rights

### Control Over Your Data

- You can disable the extension at any time through the popup interface
- You can configure which platforms to use with the extension
- You can change or remove your Xget domain configuration
- Uninstalling the extension removes all stored settings

### Data Portability

- Settings are stored in standard Chrome storage format
- You can export/backup Chrome extension settings through Chrome's sync feature

### Data Deletion

- Clear extension data by uninstalling the extension
- Reset settings through the extension popup interface
- Clear Chrome's extension storage to remove all traces

## Children's Privacy

This extension is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. When we do, we will:

- Update the "Last updated" date at the top of this policy
- Notify users through the extension interface if there are material changes
- Maintain previous versions for reference

## Compliance

This extension is designed to comply with:

- Chrome Web Store Developer Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable privacy laws

## Technical Implementation

### Data Minimization

- We collect only the minimum data necessary for functionality
- No analytics, tracking, or telemetry data is collected
- No user identification or profiling occurs

### Transparency

- All source code is available for review
- Extension behavior is predictable and documented
- No hidden data collection or processing

## Contact Information

If you have any questions about this privacy policy or the extension's data practices:

- **Developer**: Xi Xu
- **Repository**: [Xget for Chrome on GitHub](https://github.com/xixu-me/Xget-for-Chrome)
- **Issues**: [Report Issues](https://github.com/xixu-me/Xget-for-Chrome/issues)

## Open Source Commitment

This extension is open source software licensed under GPL-3.0. You can:

- Review the complete source code
- Verify our privacy practices
- Submit issues or improvements
- Fork and modify the code

## Data Protection Summary

| Data Type | Collection | Storage | Sharing | Retention |
|-----------|------------|---------|---------|-----------|
| Extension Settings | Local only | Browser storage | Chrome sync only | Until uninstall |
| Download URLs | Processed locally | Not stored | Redirected only | Real-time only |
| Personal Information | None | None | None | None |
| Browsing History | None | None | None | None |
| User Identity | None | None | None | None |

---

By using Xget for Chrome, you acknowledge that you have read and understood this privacy policy and agree to the data practices described herein.
