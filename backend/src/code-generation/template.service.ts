import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private templates = new Map<string, HandlebarsTemplateDelegate>();

  constructor() {
    this.registerHelpers();
    this.loadTemplates();
  }

  async render(templateName: string, data: any): Promise<string> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template(data);
  }

  private registerHelpers() {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('ne', (a, b) => a !== b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('lt', (a, b) => a < b);
    Handlebars.registerHelper('and', (a, b) => a && b);
    Handlebars.registerHelper('or', (a, b) => a || b);
    Handlebars.registerHelper('not', (a) => !a);
    
    Handlebars.registerHelper('capitalize', (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    
    Handlebars.registerHelper('lowercase', (str) => {
      return str.toLowerCase();
    });
    
    Handlebars.registerHelper('uppercase', (str) => {
      return str.toUpperCase();
    });
    
    Handlebars.registerHelper('pascalCase', (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    });
    
    Handlebars.registerHelper('camelCase', (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    });
    
    Handlebars.registerHelper('snakeCase', (str) => {
      return str.replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
    });
    
    Handlebars.registerHelper('kebabCase', (str) => {
      return str.replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');
    });
    
    Handlebars.registerHelper('json', (obj) => {
      return JSON.stringify(obj, null, 2);
    });
    
    Handlebars.registerHelper('formatDate', (date) => {
      return new Date(date).toISOString();
    });
    
    Handlebars.registerHelper('each_with_index', function(array, options) {
      let result = '';
      for (let i = 0; i < array.length; i++) {
        result += options.fn({...array[i], index: i});
      }
      return result;
    });
  }

  private loadTemplates() {
    const templatesDir = path.join(process.cwd(), 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      console.warn('Templates directory not found, using inline templates');
      this.loadInlineTemplates();
      return;
    }

    try {
      const templateFiles = fs.readdirSync(templatesDir);
      
      templateFiles.forEach(file => {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templatePath = path.join(templatesDir, file);
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          const template = Handlebars.compile(templateContent);
          this.templates.set(templateName, template);
        }
      });
    } catch (error) {
      console.warn('Error loading templates:', error.message);
      this.loadInlineTemplates();
    }
  }

  private loadInlineTemplates() {
    const templates = {
      'flutter-main': `
import 'package:flutter/material.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_datastore/amplify_datastore.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';

void main() {
  runApp({{capitalize appName}}App());
}

class {{capitalize appName}}App extends StatefulWidget {
  @override
  _{{capitalize appName}}AppState createState() => _{{capitalize appName}}AppState();
}

class _{{capitalize appName}}AppState extends State<{{capitalize appName}}App> {
  @override
  void initState() {
    super.initState();
    _configureAmplify();
  }

  void _configureAmplify() async {
    try {
      await Amplify.addPlugins([
        AmplifyDataStore(),
        AmplifyAuthCognito(),
      ]);
      await Amplify.configure(amplifyconfig);
    } catch (e) {
      print('Error configuring Amplify: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{{appName}}',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: HomeScreen(),
    );
  }
}
`,
      'flutter-screen': `
import 'package:flutter/material.dart';

class {{pascalCase screenName}}Screen extends StatefulWidget {
  @override
  _{{pascalCase screenName}}ScreenState createState() => _{{pascalCase screenName}}ScreenState();
}

class _{{pascalCase screenName}}ScreenState extends State<{{pascalCase screenName}}Screen> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('{{screenName}}'),
      ),
      body: Stack(
        children: [
          {{{components}}}
        ],
      ),
    );
  }
}
`,
      'flutter-pubspec': `
name: {{snakeCase appName}}
description: {{description}}
version: 1.0.0+1

environment:
  sdk: ">=2.17.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  amplify_flutter: ^1.0.0
  amplify_datastore: ^1.0.0
  amplify_auth_cognito: ^1.0.0
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
`,
      'amplify-data': `
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
{{{models}}}
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
`,
      'amplify-auth': `
import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
    },
    given_name: {
      required: true,
    },
    family_name: {
      required: true,
    },
  },
});
`,
      'amplify-storage': `
import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "myProjectFiles",
  access: (allow) => ({
    "profile-pictures/*": [
      allow.authenticated.to(["read", "write"]),
    ],
    "public/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write"]),
    ],
  }),
});
`,
      'amplify-backend': `
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

export const backend = defineBackend({
  auth,
  data,
  storage,
});
`,
      'github-deploy': `
name: Deploy to Amplify

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.10.0'
    
    - name: Install dependencies
      run: flutter pub get
    
    - name: Run tests
      run: flutter test
    
    - name: Build for Android
      run: flutter build apk --release
    
    - name: Build for iOS
      run: flutter build ios --release --no-codesign
    
    - name: Deploy to Amplify
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
`,
      'admin-dashboard': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{appName}} Admin Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin: 10px 0; }
        .btn { background: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{appName}} Admin Dashboard</h1>
        <p>Manage your app data and settings</p>
    </div>
    
    <div class="card">
        <h2>Data Management</h2>
        <p>Manage your app's database records</p>
        <button class="btn">View Data</button>
    </div>
    
    <div class="card">
        <h2>Analytics</h2>
        <p>View app usage statistics</p>
        <button class="btn">View Analytics</button>
    </div>
    
    <div class="card">
        <h2>Settings</h2>
        <p>Configure app settings</p>
        <button class="btn">Manage Settings</button>
    </div>
</body>
</html>
`,
    };

    Object.entries(templates).forEach(([name, content]) => {
      const template = Handlebars.compile(content);
      this.templates.set(name, template);
    });
  }
}