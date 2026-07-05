from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ArabicNumber',
            fields=[
                ('value', models.PositiveSmallIntegerField(primary_key=True, serialize=False)),
                ('numeral', models.CharField(max_length=8)),
                ('script', models.CharField(max_length=64)),
                ('english', models.CharField(max_length=32)),
                ('transliteration', models.CharField(max_length=64)),
            ],
            options={
                'ordering': ['value'],
            },
        ),
    ]
