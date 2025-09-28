// election-2/
// ├── package.json
// ├── .env.example
// ├── .gitignore
// ├── server.js
// ├── config/
// │   ├── database.js
// │   ├── cloudinary.js
// │   └── constants.js
// ├── models/
// │   ├── index.js
// │   ├── Election.js
// │   ├── Question.js
// │   ├── Answer.js
// │   ├── ElectionAccess.js
// │   ├── ElectionBranding.js
// │   ├── ElectionLottery.js
// │   └── ElectionSecurity.js
// ├── controllers/
// │   ├── electionController.js
// │   ├── questionController.js
// │   ├── lotteryController.js
// │   └── uploadController.js
// ├── routes/
// │   ├── index.js
// │   ├── electionRoutes.js
// │   ├── questionRoutes.js
// │   ├── lotteryRoutes.js
// │   └── uploadRoutes.js
// ├── middleware/
// │   ├── roleAuth.js
// │   ├── validation.js
// │   ├── upload.js
// │   └── errorHandler.js
// ├── services/
// │   ├── electionService.js
// │   ├── questionService.js
// │   ├── lotteryService.js
// │   ├── uploadService.js
// │   ├── securityService.js
// │   └── notificationService.js
// ├── validators/
// │   ├── electionValidators.js
// │   ├── questionValidators.js
// │   └── lotteryValidators.js
// ├── utils/
// │   ├── helpers.js
// │   ├── constants.js
// │   ├── encryption.js
// │   └── urlGenerator.js
// └── database/
//     ├── migrations/
//     │   ├── 001_create_elections.sql
//     │   ├── 002_create_questions.sql
//     │   ├── 003_create_answers.sql
//     │   ├── 004_create_election_access.sql
//     │   ├── 005_create_election_branding.sql
//     │   ├── 006_create_election_lottery.sql
//     │   └── 007_create_election_security.sql
//     └── seeds/
//         └── initial_data.sql