import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth.models import User

def create_admin():
    username = 'admin'
    email = 'admin@furniture.com'
    password = 'admin123'
    
    if User.objects.filter(username=username).exists():
        print(f'Admin user "{username}" already exists!')
        admin_user = User.objects.get(username=username)
    else:
        admin_user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='User'
        )
        print(f'Admin user "{username}" created successfully!')
    
    print(f'Username: {username}')
    print(f'Password: {password}')
    print(f'Email: {email}')
    print(f'Is Staff: {admin_user.is_staff}')
    print(f'Is Superuser: {admin_user.is_superuser}')

if __name__ == '__main__':
    create_admin()