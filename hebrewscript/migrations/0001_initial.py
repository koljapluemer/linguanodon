from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Clip',
            fields=[
                ('filename', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('transcript', models.TextField()),
            ],
        ),
    ]
