# Generated by Django 3.2.9 on 2022-02-17 16:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_alter_post_likes'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='description',
            new_name='content',
        ),
    ]