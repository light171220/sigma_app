-- Seed data for component types
INSERT INTO component_types (name, category, properties_schema, flutter_template) VALUES
('text', 'basic', '{
  "text": {"type": "string", "default": "Text"},
  "fontSize": {"type": "number", "default": 16},
  "color": {"type": "string", "default": "#000000"},
  "fontWeight": {"type": "string", "default": "normal"},
  "textAlign": {"type": "string", "default": "left"}
}', 'Text(''{{text}}'', style: TextStyle(fontSize: {{fontSize}}, color: Color(0xFF{{color}})))'),

('button', 'input', '{
  "text": {"type": "string", "default": "Button"},
  "backgroundColor": {"type": "string", "default": "#2196F3"},
  "textColor": {"type": "string", "default": "#FFFFFF"},
  "borderRadius": {"type": "number", "default": 4}
}', 'ElevatedButton(onPressed: () {}, child: Text(''{{text}}''), style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF{{backgroundColor}})))'),

('input', 'input', '{
  "placeholder": {"type": "string", "default": "Enter text"},
  "inputType": {"type": "string", "default": "text"},
  "isPassword": {"type": "boolean", "default": false}
}', 'TextField(decoration: InputDecoration(hintText: ''{{placeholder}}''), obscureText: {{isPassword}})'),

('image', 'media', '{
  "url": {"type": "string", "default": "https://via.placeholder.com/100"},
  "fit": {"type": "string", "default": "cover"}
}', 'Image.network(''{{url}}'', fit: BoxFit.{{fit}})'),

('container', 'layout', '{
  "backgroundColor": {"type": "string", "default": "#FFFFFF"},
  "borderRadius": {"type": "number", "default": 0},
  "borderWidth": {"type": "number", "default": 0},
  "borderColor": {"type": "string", "default": "#000000"}
}', 'Container(decoration: BoxDecoration(color: Color(0xFF{{backgroundColor}}), borderRadius: BorderRadius.circular({{borderRadius}})))'),

('list', 'data', '{
  "dataSource": {"type": "string", "default": "items"},
  "titleField": {"type": "string", "default": "name"},
  "subtitleField": {"type": "string", "default": "description"}
}', 'ListView.builder(itemBuilder: (context, index) => ListTile(title: Text(item.{{titleField}})))');

-- Seed data for subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, limits) VALUES
('free', 0.00, 0.00, '["basic_components", "3_apps", "community_support"]', '{
  "maxApps": 3,
  "maxDeployments": 10,
  "storage": "1GB",
  "customDomain": false,
  "analytics": false,
  "support": "community"
}'),

('pro', 29.99, 299.99, '["all_components", "25_apps", "email_support", "custom_domain", "analytics"]', '{
  "maxApps": 25,
  "maxDeployments": 100,
  "storage": "10GB",
  "customDomain": true,
  "analytics": true,
  "support": "email"
}'),

('enterprise', 99.99, 999.99, '["unlimited_apps", "priority_support", "white_label", "advanced_analytics", "custom_integrations"]', '{
  "maxApps": 100,
  "maxDeployments": 1000,
  "storage": "100GB",
  "customDomain": true,
  "analytics": true,
  "support": "priority"
}');

-- Create demo user (password: demo123456)
INSERT INTO users (email, password_hash, first_name, last_name, email_verified, subscription_plan) VALUES
('demo@sigma.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBGWiGr5jl4QXG', 'Demo', 'User', true, 'pro');

-- Get the demo user ID for creating demo app
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@sigma.com';
    
    -- Create demo app
    INSERT INTO apps (
        user_id, 
        name, 
        package_name, 
        description, 
        category,
        app_config,
        screens,
        database_schema,
        theme,
        status
    ) VALUES (
        demo_user_id,
        'Demo Store',
        'com.sigma.demostore',
        'A demo e-commerce application',
        'business',
        '{"version": "1.0.0"}',
        '[
            {
                "id": "home_screen",
                "name": "Home",
                "isDefault": true,
                "components": [
                    {
                        "id": "welcome_text",
                        "type": "text",
                        "position": {"x": 50, "y": 100},
                        "size": {"width": 300, "height": 40},
                        "properties": {
                            "text": "Welcome to Demo Store",
                            "fontSize": 24,
                            "color": "#333333",
                            "fontWeight": "bold",
                            "textAlign": "center"
                        }
                    },
                    {
                        "id": "products_btn",
                        "type": "button",
                        "position": {"x": 100, "y": 200},
                        "size": {"width": 200, "height": 50},
                        "properties": {
                            "text": "View Products",
                            "backgroundColor": "#2196F3",
                            "textColor": "#FFFFFF",
                            "borderRadius": 8
                        },
                        "actions": [
                            {
                                "trigger": "onPressed",
                                "type": "navigate",
                                "target": "products_screen"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "products_screen",
                "name": "Products",
                "isDefault": false,
                "components": [
                    {
                        "id": "products_list",
                        "type": "list",
                        "position": {"x": 0, "y": 0},
                        "size": {"width": 400, "height": 600},
                        "properties": {
                            "dataSource": "products",
                            "titleField": "name",
                            "subtitleField": "price"
                        }
                    }
                ]
            }
        ]',
        '{
            "tables": [
                {
                    "id": "products_table",
                    "name": "products",
                    "fields": [
                        {
                            "name": "name",
                            "type": "string",
                            "required": true,
                            "maxLength": 100
                        },
                        {
                            "name": "price",
                            "type": "float",
                            "required": true,
                            "min": 0
                        },
                        {
                            "name": "description",
                            "type": "text",
                            "required": false
                        },
                        {
                            "name": "image",
                            "type": "url",
                            "required": false
                        },
                        {
                            "name": "category",
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "inStock",
                            "type": "boolean",
                            "default": true
                        }
                    ]
                }
            ]
        }',
        '{
            "primaryColor": "#2196F3",
            "secondaryColor": "#FFC107",
            "fontFamily": "Roboto",
            "darkMode": false
        }',
        'draft'
    );
END $$;