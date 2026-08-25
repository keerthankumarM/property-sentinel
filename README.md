# Land watcher

Project Prompt

Build an AI-Powered Automated Land and Property Dispute Monitoring System where users can upload newspapers, scanned newspaper pages, newspaper PDFs, images, and other legally obtained news documents. The system must automatically identify and display all news related to land, property, ownership disputes, encroachment, illegal possession, land grabbing, boundary disputes, court cases, property fraud, and other land-related issues.

1. Newspaper Upload

Allow the user to upload:

Complete newspaper PDFs

Scanned newspaper pages

JPG/PNG newspaper images

Multiple newspapers at once

Newspapers in different regional languages

The user should not have to manually search every article.

2. Automatic OCR

After uploading a newspaper:

Uploaded Newspaper
        ↓
Image/PDF Processing
        ↓
OCR
        ↓
Text Extraction
        ↓
Article Detection


Use OCR technologies such as:

Tesseract OCR

PaddleOCR

Google Cloud Vision OCR

The system should preserve the original newspaper image and extracted text so that the user can compare the AI result with the original article.

3. Automatically Find Land/Property News

The AI must scan the entire newspaper and identify articles related to:

Land disputes

Property disputes

Ownership disputes

Land grabbing

Encroachment

Illegal possession

Boundary disputes

Survey-number disputes

Property fraud

Fake land documents

Government land disputes

Court cases involving property

Acquisition disputes

Inheritance/property disputes

Construction disputes

Real-estate fraud

For example, if a 30-page newspaper contains 300 articles and only 7 are related to land/property, the system should automatically identify those 7 articles.

4. Land Information Extraction

For every detected article, use AI/NLP to extract:

Article Title
Newspaper Name
Publication Date
Language
Person Names
Land Owner Names
Survey Number
Property Location
Village
Taluk
District
Area/Extent of Land
Dispute Type
Court/Case Information
Organizations Involved
Important Dates
Source Page


Example:

LAND DISPUTE DETECTED

Survey Number: 145/2
Location: Bengaluru Rural
Village: Example Village
Area: 2.5 Acres

Dispute:
Ownership Dispute

Persons Mentioned:
Person A
Person B

Court:
Civil Court

Risk:
HIGH


5. Show the Original News

The system must display both:

Original Article

Newspaper image

Page number

Original headline

Original article

AI Extracted Information

Property details

Survey number

People involved

Location

Dispute type

Risk level

The user should be able to click the extracted information and verify it against the original newspaper.

6. Property Monitoring

Allow the user to register properties that they want to monitor.

Example:

Property Monitoring

Survey Number: 145/2
Village: Example Village
Taluk: Example Taluk
District: Bengaluru Rural
Owner: User/Company


The system stores this property as a monitored property.

7. Automatic Matching

Whenever a new newspaper is uploaded, the AI automatically compares the newly extracted land/property information against all monitored properties.

Example:

Previously Monitored Property

Survey No: 145/2
Bengaluru Rural


New newspaper:

"Ownership dispute reported regarding
Survey No. 145/2..."


The system detects the match.

8. Immediate Alert

When a match is detected:

🚨 LAND DISPUTE ALERT

A new newspaper article has been detected
that may relate to your monitored property.

Survey Number: 145/2
Location: Bengaluru Rural

Issue:
Ownership Dispute

Risk Level:
HIGH

Source:
Newspaper Name

Date:
19-Aug-2026

Please verify the original article and
official/legal records before taking action.


Send the alert through:

SMS

Email

WhatsApp Business API

Web notification

Mobile push notification

9. Important Verification Layer

The AI must NOT automatically declare that someone legally owns, occupies, or is taking possession of land merely because their name appears in a newspaper.

Use a verification status:

UNVERIFIED
     ↓
AI DETECTED
     ↓
SOURCE VERIFIED
     ↓
OFFICIAL RECORD VERIFIED
     ↓
CONFIRMED


The system should clearly distinguish between:

AI-detected information and officially verified information.

10. Dashboard

Create a dashboard containing:

-----------------------------------------
LAND & PROPERTY MONITORING DASHBOARD
-----------------------------------------

Total Newspapers Uploaded       125
Land Articles Detected            48
Properties Monitored              12
New Alerts                         5
High Risk Properties               3

-----------------------------------------
RECENT LAND DISPUTES
-----------------------------------------

Survey No. 145/2     HIGH
Survey No. 89/1      MEDIUM
Survey No. 201       HIGH
-----------------------------------------


Include filters for:

Date

District

Taluk

Village

Survey number

Dispute type

Risk level

Newspaper

Language

11. Map View

Display detected properties on a map when reliable location information is available.

Example:

                 MAP

       🔴 High Risk Property

       🟠 Medium Risk Property

       🟢 Low Risk / No Dispute Found


Use OpenStreetMap or another legally available mapping service.

12. Secure Document Storage

Store:

Original newspaper

Original article image

OCR text

Extracted information

Verification records

Alert history

User/property information

Maintain timestamps and source information so that the user can trace where every piece of information came from.

13. Recommended Technology Stack

Frontend:

React.js / Next.js

Tailwind CSS

Map interface

Backend:

Python

FastAPI

OCR:

PaddleOCR

Tesseract OCR

AI/NLP:

Gemini API or another suitable LLM

Named Entity Recognition

Text classification

Semantic similarity matching

Database:

PostgreSQL

Document Storage:

Supabase Storage / Firebase Storage

Notifications:

Twilio SMS

Email API

WhatsApp Business API

Push notifications

Maps:

OpenStreetMap

14. Complete System Architecture

              USER
                |
                ↓
       Upload Newspaper/PDF
                |
                ↓
          OCR PROCESSING
                |
                ↓
        TEXT + ARTICLE SPLIT
                |
                ↓
       AI LAND NEWS DETECTION
                |
                ↓
     LAND INFORMATION EXTRACTION
                |
                ↓
       VERIFICATION ENGINE
                |
                ↓
       LAND DISPUTE DATABASE
                |
        ┌───────┴────────┐
        ↓                ↓
   DASHBOARD          PROPERTY
                     MONITORING
                         |
                         ↓
                  NEW MATCH FOUND
                         |
                         ↓
                  RISK ANALYSIS
                         |
                         ↓
                 IMMEDIATE ALERT
                         |
             ┌───────────┼───────────┐
             ↓           ↓           ↓
            SMS        EMAIL      WHATSAPP


Final Goal

The final system should work like an early-warning system for land and property disputes.

The user uploads newspapers → the AI reads the entire newspaper → automatically finds land/property-related articles → extracts property and dispute information → displays the original article and extracted information → compares it with monitored properties → verifies available information → and immediately alerts the authorized user when a potentially relevant new dispute is detected.

The system should assist property due diligence, not replace legal verification or government land records.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2cde1021-6378-472e-93e4-4ca1700022cb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
