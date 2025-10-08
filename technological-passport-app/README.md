# Technological Passport Management System

A web-based application for managing technological passports in manufacturing processes. This system allows users to view, track, and manage assembly process sheets with database integration.

## Features

- **Form Layout**: Replicates the exact design of the technological passport document
- **Database Integration**: Fetches data from MySQL database
- **Real-time Updates**: Live data loading and refresh capabilities
- **Print Support**: Built-in print functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Quality Control**: Track assembly status and inspector information

## Project Structure

```
technological-passport-app/
├── public/
│   └── index.html              # Main HTML file
├── src/
│   ├── components/
│   │   └── passport-form.js    # Frontend JavaScript logic
│   ├── services/
│   │   └── api.js              # API service layer
│   └── styles/
│       └── main.css            # CSS styling
├── backend/
│   ├── config/
│   │   └── schema.sql          # Database schema
│   ├── server.js               # Express server
│   └── package.json            # Backend dependencies
└── README.md                   # This file
```

## Prerequisites

- Node.js (version 14 or higher)
- MySQL database server
- npm or yarn package manager

## Installation

### 1. Database Setup

1. Install MySQL server on your system
2. Create a new database and user:

```sql
CREATE DATABASE technological_passport_db;
CREATE USER 'passport_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON technological_passport_db.* TO 'passport_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Import the database schema:

```bash
mysql -u passport_user -p technological_passport_db < backend/config/schema.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=passport_user
DB_PASSWORD=your_password
DB_NAME=technological_passport_db
PORT=3000
```

5. Start the backend server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### 3. Frontend Setup

The frontend is served statically by the Express server. No additional setup is required.

## Usage

1. **Start the Application**:
   - Ensure MySQL is running
   - Start the backend server (`npm start` in backend directory)
   - Open your browser and navigate to `http://localhost:3000`

2. **Load Passport Data**:
   - Click the "Load Passport Data" button
   - Select a passport from the list
   - The form will populate with data from the database

3. **Refresh Data**:
   - Click "Refresh" to reload the current passport data

4. **Print Passport**:
   - Click "Print" to print the current passport

## API Endpoints

- `GET /api/passports` - Get all passports
- `GET /api/passports/:id` - Get passport by ID
- `GET /api/passports/:id/steps` - Get process steps for a passport
- `PUT /api/passports/:id/status` - Update passport status
- `GET /api/assembly-types` - Get assembly types
- `GET /api/inspectors` - Get quality inspectors
- `POST /api/passports` - Create new passport

## Database Schema

The system uses the following main tables:

- `technological_passports` - Main passport data
- `assembly_types` - Assembly type lookup
- `quality_inspectors` - Inspector information
- `process_steps` - Detailed process tracking

## Customization

### Adding New Fields

1. Update the database schema in `backend/config/schema.sql`
2. Modify the HTML form in `public/index.html`
3. Update the CSS styling in `src/styles/main.css`
4. Extend the API endpoints in `backend/server.js`
5. Update the frontend JavaScript in `src/components/passport-form.js`

### Styling Changes

The CSS file (`src/styles/main.css`) contains all styling. Key sections:

- `.header-section` - Top document header
- `.central-title` - Main title section
- `.form-section` - Form fields area
- `.footer-section` - Signature area

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify MySQL is running
   - Check database credentials in `.env` file
   - Ensure database exists and schema is imported

2. **API Not Responding**:
   - Check if backend server is running on port 3000
   - Verify CORS settings if accessing from different domain

3. **Data Not Loading**:
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible
   - Check database has sample data

### Logs

Backend logs are displayed in the console. Check for:
- Database connection status
- API request/response logs
- Error messages

## Development

### Adding New Features

1. **Backend**: Add new routes in `backend/server.js`
2. **Frontend**: Extend the `PassportAPI` class in `src/services/api.js`
3. **UI**: Update the `PassportForm` class in `src/components/passport-form.js`

### Testing

To test the application:

1. Ensure sample data is loaded in the database
2. Start the backend server
3. Open the frontend in a browser
4. Test all functionality including data loading, refresh, and print

## License

MIT License - feel free to modify and use as needed.

## Support

For issues or questions, please check the troubleshooting section or create an issue in the project repository.