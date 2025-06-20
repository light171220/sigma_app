import { Injectable } from '@nestjs/common';
import { TemplateService } from './template.service';
import { FlutterProject, Component, Screen } from './generation.interface';

@Injectable()
export class FlutterGeneratorService {
  constructor(private templateService: TemplateService) {}

  async generate(app: any): Promise<FlutterProject> {
    const mainDart = await this.generateMainDart(app);
    const screens = await this.generateScreens(app);
    const pubspec = await this.generatePubspec(app);
    const amplifyConfig = await this.generateAmplifyConfig(app);

    return {
      'lib/main.dart': mainDart,
      'pubspec.yaml': pubspec,
      'amplify_config.dart': amplifyConfig,
      ...screens,
    };
  }

  async generateMainScreen(app: any): Promise<string> {
    const homeScreen = app.screens.find(s => s.isDefault) || app.screens[0];
    return this.generateScreen(homeScreen, app);
  }

  private async generateMainDart(app: any): Promise<string> {
    return this.templateService.render('flutter-main', {
      appName: app.name,
      packageName: app.packageName,
      theme: app.theme,
      screens: app.screens,
    });
  }

  private async generateScreens(app: any): Promise<Record<string, string>> {
    const screens = {};
    
    for (const screen of app.screens) {
      const screenCode = await this.generateScreen(screen, app);
      const fileName = `lib/screens/${screen.name.toLowerCase().replace(/\s+/g, '_')}_screen.dart`;
      screens[fileName] = screenCode;
    }

    return screens;
  }

  private async generateScreen(screen: Screen, app: any): Promise<string> {
    const components = screen.components.map(component => 
      this.generateComponent(component, app.databaseSchema)
    ).join('\n          ');

    return this.templateService.render('flutter-screen', {
      screenName: screen.name,
      className: this.toPascalCase(screen.name),
      components,
      navigation: screen.navigation || {},
      theme: app.theme,
    });
  }

  private generateComponent(component: Component, databaseSchema: any): string {
    switch (component.type) {
      case 'text':
        return this.generateTextComponent(component);
      case 'button':
        return this.generateButtonComponent(component);
      case 'image':
        return this.generateImageComponent(component);
      case 'input':
        return this.generateInputComponent(component);
      case 'list':
        return this.generateListComponent(component, databaseSchema);
      case 'form':
        return this.generateFormComponent(component, databaseSchema);
      case 'container':
        return this.generateContainerComponent(component);
      default:
        return `// Unknown component type: ${component.type}`;
    }
  }

  private generateTextComponent(component: Component): string {
    const props = component.properties || {};
    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 100},
              height: ${component.size?.height || 30},
              child: Text(
                '${props.text || 'Text'}',
                style: TextStyle(
                  fontSize: ${props.fontSize || 16},
                  color: Color(0xFF${(props.color || '#000000').replace('#', '')}),
                  fontWeight: ${props.fontWeight === 'bold' ? 'FontWeight.bold' : 'FontWeight.normal'},
                ),
                textAlign: ${this.getTextAlign(props.textAlign)},
              ),
            ),
          )`;
  }

  private generateButtonComponent(component: Component): string {
    const props = component.properties || {};
    const actions = component.actions || [];
    const onPressed = actions.find(a => a.trigger === 'onPressed');
    
    let onPressedCode = '() {}';
    if (onPressed && onPressed.type === 'navigate') {
      onPressedCode = `() { Navigator.pushNamed(context, '/${onPressed.target}'); }`;
    }

    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 120},
              height: ${component.size?.height || 40},
              child: ElevatedButton(
                onPressed: ${onPressedCode},
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF${(props.backgroundColor || '#2196F3').replace('#', '')}),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(${props.borderRadius || 4}),
                  ),
                ),
                child: Text(
                  '${props.text || 'Button'}',
                  style: TextStyle(
                    color: Color(0xFF${(props.textColor || '#FFFFFF').replace('#', '')}),
                  ),
                ),
              ),
            ),
          )`;
  }

  private generateImageComponent(component: Component): string {
    const props = component.properties || {};
    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 100},
              height: ${component.size?.height || 100},
              child: Image.network(
                '${props.url || 'https://via.placeholder.com/100'}',
                fit: BoxFit.${props.fit || 'cover'},
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey[300],
                    child: Icon(Icons.image, color: Colors.grey[600]),
                  );
                },
              ),
            ),
          )`;
  }

  private generateInputComponent(component: Component): string {
    const props = component.properties || {};
    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 200},
              height: ${component.size?.height || 50},
              child: TextField(
                decoration: InputDecoration(
                  hintText: '${props.placeholder || 'Enter text'}',
                  border: OutlineInputBorder(),
                ),
                keyboardType: ${this.getKeyboardType(props.inputType)},
                obscureText: ${props.isPassword || false},
              ),
            ),
          )`;
  }

  private generateListComponent(component: Component, databaseSchema: any): string {
    const props = component.properties || {};
    const dataSource = props.dataSource || 'items';
    
    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 300},
              height: ${component.size?.height || 400},
              child: StreamBuilder(
                stream: Amplify.DataStore.observeQuery(${this.toPascalCase(dataSource)}),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) {
                    return CircularProgressIndicator();
                  }
                  return ListView.builder(
                    itemCount: snapshot.data!.items.length,
                    itemBuilder: (context, index) {
                      final item = snapshot.data!.items[index];
                      return ListTile(
                        title: Text(item.${props.titleField || 'name'}),
                        subtitle: Text(item.${props.subtitleField || 'description'}),
                        onTap: () {
                          // Handle item tap
                        },
                      );
                    },
                  );
                },
              ),
            ),
          )`;
  }

  private generateFormComponent(component: Component, databaseSchema: any): string {
    const props = component.properties || {};
    const tableName = props.tableName || 'items';
    const table = databaseSchema.tables.find(t => t.name === tableName);
    
    if (!table) {
      return `// Table ${tableName} not found in schema`;
    }

    const formFields = table.fields.map(field => `
              TextFormField(
                decoration: InputDecoration(labelText: '${this.toTitleCase(field.name)}'),
                validator: ${field.required ? '(value) => value?.isEmpty ?? true ? "Required" : null' : 'null'},
              ),`).join('\n');

    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 300},
              height: ${component.size?.height || 400},
              child: Form(
                key: _formKey,
                child: Column(
                  children: [${formFields}
                    ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          // Submit form
                        }
                      },
                      child: Text('Submit'),
                    ),
                  ],
                ),
              ),
            ),
          )`;
  }

  private generateContainerComponent(component: Component): string {
    const props = component.properties || {};
    return `
          Positioned(
            left: ${component.position?.x || 0},
            top: ${component.position?.y || 0},
            child: Container(
              width: ${component.size?.width || 100},
              height: ${component.size?.height || 100},
              decoration: BoxDecoration(
                color: Color(0xFF${(props.backgroundColor || '#FFFFFF').replace('#', '')}),
                borderRadius: BorderRadius.circular(${props.borderRadius || 0}),
                border: ${props.borderWidth ? `Border.all(width: ${props.borderWidth}, color: Color(0xFF${(props.borderColor || '#000000').replace('#', '')}))` : 'null'},
              ),
            ),
          )`;
  }

  private async generatePubspec(app: any): Promise<string> {
    return this.templateService.render('flutter-pubspec', {
      appName: app.name,
      packageName: app.packageName,
      description: app.description || 'A Flutter application',
    });
  }

  private async generateAmplifyConfig(app: any): Promise<string> {
    return `
const amplifyconfig = '''{
    "UserAgent": "aws-amplify-cli/2.0",
    "Version": "1.0"
}''';
`;
  }

  private getTextAlign(align: string): string {
    switch (align) {
      case 'left': return 'TextAlign.left';
      case 'center': return 'TextAlign.center';
      case 'right': return 'TextAlign.right';
      case 'justify': return 'TextAlign.justify';
      default: return 'TextAlign.left';
    }
  }

  private getKeyboardType(inputType: string): string {
    switch (inputType) {
      case 'email': return 'TextInputType.emailAddress';
      case 'number': return 'TextInputType.number';
      case 'phone': return 'TextInputType.phone';
      case 'url': return 'TextInputType.url';
      default: return 'TextInputType.text';
    }
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}