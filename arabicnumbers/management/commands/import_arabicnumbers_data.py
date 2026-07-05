from django.core.management.base import BaseCommand

from arabicnumbers.models import ArabicNumber

# (value, numeral, script, english, transliteration) - ported verbatim from
# arabic-numbers-practice/src/numbers.ts (Egyptian Arabic).
NUMBERS = [
    (0, "٠", "صفر", "Zero", "sifr"),
    (1, "١", "واحد", "One", "wahed"),
    (2, "٢", "اتنين", "Two", "itneen"),
    (3, "٣", "تلاتة", "Three", "talata"),
    (4, "٤", "أربعة", "Four", "arba'a"),
    (5, "٥", "خمسة", "Five", "khamsa"),
    (6, "٦", "ستة", "Six", "sitta"),
    (7, "٧", "سبعة", "Seven", "saba'a"),
    (8, "٨", "تمنية", "Eight", "tamanya"),
    (9, "٩", "تسعة", "Nine", "tes'a"),
    (10, "١٠", "عشرة", "Ten", "ashara"),
    (11, "١١", "أحد عشر", "Eleven", "ahad 'ashar"),
    (12, "١٢", "اتنا عشر", "Twelve", "itna 'ashar"),
    (13, "١٣", "تلاتا عشر", "Thirteen", "talata 'ashar"),
    (14, "١٤", "أربعة عشر", "Fourteen", "arba'a 'ashar"),
    (15, "١٥", "خمسة عشر", "Fifteen", "khamsa 'ashar"),
    (16, "١٦", "ستة عشر", "Sixteen", "sitta 'ashar"),
    (17, "١٧", "سبعة عشر", "Seventeen", "saba'a 'ashar"),
    (18, "١٨", "تمنية عشر", "Eighteen", "tamanya 'ashar"),
    (19, "١٩", "تسعة عشر", "Nineteen", "tes'a 'ashar"),
    (20, "٢٠", "عشرين", "Twenty", "ishreen"),
    (21, "٢١", "واحد وعشرين", "Twenty-One", "wahed w'ishreen"),
    (22, "٢٢", "اتنين وعشرين", "Twenty-Two", "itneen w'ishreen"),
    (23, "٢٣", "تلاتة وعشرين", "Twenty-Three", "talata w'ishreen"),
    (24, "٢٤", "أربعة وعشرين", "Twenty-Four", "arba'a w'ishreen"),
    (25, "٢٥", "خمسة وعشرين", "Twenty-Five", "khamsa w'ishreen"),
    (26, "٢٦", "ستة وعشرين", "Twenty-Six", "sitta w'ishreen"),
    (27, "٢٧", "سبعة وعشرين", "Twenty-Seven", "saba'a w'ishreen"),
    (28, "٢٨", "تمنية وعشرين", "Twenty-Eight", "tamanya w'ishreen"),
    (29, "٢٩", "تسعة وعشرين", "Twenty-Nine", "tes'a w'ishreen"),
    (30, "٣٠", "تلاتين", "Thirty", "talateen"),
    (31, "٣١", "واحد وتلاتين", "Thirty-One", "wahed w'talateen"),
    (32, "٣٢", "اتنين وتلاتين", "Thirty-Two", "itneen w'talateen"),
    (33, "٣٣", "تلاتة وتلاتين", "Thirty-Three", "talata w'talateen"),
    (34, "٣٤", "أربعة وتلاتين", "Thirty-Four", "arba'a w'talateen"),
    (35, "٣٥", "خمسة وتلاتين", "Thirty-Five", "khamsa w'talateen"),
    (36, "٣٦", "ستة وتلاتين", "Thirty-Six", "sitta w'talateen"),
    (37, "٣٧", "سبعة وتلاتين", "Thirty-Seven", "saba'a w'talateen"),
    (38, "٣٨", "تمنية وتلاتين", "Thirty-Eight", "tamanya w'talateen"),
    (39, "٣٩", "تسعة وتلاتين", "Thirty-Nine", "tes'a w'talateen"),
    (40, "٤٠", "أربعين", "Forty", "arba'een"),
    (41, "٤١", "واحد وأربعين", "Forty-One", "wahed w'arba'een"),
    (42, "٤٢", "اتنين وأربعين", "Forty-Two", "itneen w'arba'een"),
    (43, "٤٣", "تلاتة وأربعين", "Forty-Three", "talata w'arba'een"),
    (44, "٤٤", "أربعة وأربعين", "Forty-Four", "arba'a w'arba'een"),
    (45, "٤٥", "خمسة وأربعين", "Forty-Five", "khamsa w'arba'een"),
    (46, "٤٦", "ستة وأربعين", "Forty-Six", "sitta w'arba'een"),
    (47, "٤٧", "سبعة وأربعين", "Forty-Seven", "saba'a w'arba'een"),
    (48, "٤٨", "تمنية وأربعين", "Forty-Eight", "tamanya w'arba'een"),
    (49, "٤٩", "تسعة وأربعين", "Forty-Nine", "tes'a w'arba'een"),
    (50, "٥٠", "خمسين", "Fifty", "khamsin"),
    (51, "٥١", "واحد وخمسين", "Fifty-One", "wahed w'khamsin"),
    (52, "٥٢", "اتنين وخمسين", "Fifty-Two", "itneen w'khamsin"),
    (53, "٥٣", "تلاتة وخمسين", "Fifty-Three", "talata w'khamsin"),
    (54, "٥٤", "أربعة وخمسين", "Fifty-Four", "arba'a w'khamsin"),
    (55, "٥٥", "خمسة وخمسين", "Fifty-Five", "khamsa w'khamsin"),
    (56, "٥٦", "ستة وخمسين", "Fifty-Six", "sitta w'khamsin"),
    (57, "٥٧", "سبعة وخمسين", "Fifty-Seven", "saba'a w'khamsin"),
    (58, "٥٨", "تمنية وخمسين", "Fifty-Eight", "tamanya w'khamsin"),
    (59, "٥٩", "تسعة وخمسين", "Fifty-Nine", "tes'a w'khamsin"),
    (60, "٦٠", "ستين", "Sixty", "sittin"),
    (61, "٦١", "واحد وستين", "Sixty-One", "wahed w'sittin"),
    (62, "٦٢", "اتنين وستين", "Sixty-Two", "itneen w'sittin"),
    (63, "٦٣", "تلاتة وستين", "Sixty-Three", "talata w'sittin"),
    (64, "٦٤", "أربعة وستين", "Sixty-Four", "arba'a w'sittin"),
    (65, "٦٥", "خمسة وستين", "Sixty-Five", "khamsa w'sittin"),
    (66, "٦٦", "ستة وستين", "Sixty-Six", "sitta w'sittin"),
    (67, "٦٧", "سبعة وستين", "Sixty-Seven", "saba'a w'sittin"),
    (68, "٦٨", "تمنية وستين", "Sixty-Eight", "tamanya w'sittin"),
    (69, "٦٩", "تسعة وستين", "Sixty-Nine", "tes'a w'sittin"),
    (70, "٧٠", "سبعين", "Seventy", "saba'een"),
    (71, "٧١", "واحد وسبعين", "Seventy-One", "wahed w'saba'een"),
    (72, "٧٢", "اتنين وسبعين", "Seventy-Two", "itneen w'saba'een"),
    (73, "٧٣", "تلاتة وسبعين", "Seventy-Three", "talata w'saba'een"),
    (74, "٧٤", "أربعة وسبعين", "Seventy-Four", "arba'a w'saba'een"),
    (75, "٧٥", "خمسة وسبعين", "Seventy-Five", "khamsa w'saba'een"),
    (76, "٧٦", "ستة وسبعين", "Seventy-Six", "sitta w'saba'een"),
    (77, "٧٧", "سبعة وسبعين", "Seventy-Seven", "saba'a w'saba'een"),
    (78, "٧٨", "تمنية وسبعين", "Seventy-Eight", "tamanya w'saba'een"),
    (79, "٧٩", "تسعة وسبعين", "Seventy-Nine", "tes'a w'saba'een"),
    (80, "٨٠", "تمانين", "Eighty", "tamaneen"),
    (81, "٨١", "واحد وتمانين", "Eighty-One", "wahed w'tamaneen"),
    (82, "٨٢", "اتنين وتمانين", "Eighty-Two", "itneen w'tamaneen"),
    (83, "٨٣", "تلاتة وتمانين", "Eighty-Three", "talata w'tamaneen"),
    (84, "٨٤", "أربعة وتمانين", "Eighty-Four", "arba'a w'tamaneen"),
    (85, "٨٥", "خمسة وتمانين", "Eighty-Five", "khamsa w'tamaneen"),
    (86, "٨٦", "ستة وتمانين", "Eighty-Six", "sitta w'tamaneen"),
    (87, "٨٧", "سبعة وتمانين", "Eighty-Seven", "saba'a w'tamaneen"),
    (88, "٨٨", "تمنية وتمانين", "Eighty-Eight", "tamanya w'tamaneen"),
    (89, "٨٩", "تسعة وتمانين", "Eighty-Nine", "tes'a w'tamaneen"),
    (90, "٩٠", "تسعين", "Ninety", "tes'een"),
    (91, "٩١", "واحد وتسعين", "Ninety-One", "wahed w'tes'een"),
    (92, "٩٢", "اتنين وتسعين", "Ninety-Two", "itneen w'tes'een"),
    (93, "٩٣", "تلاتة وتسعين", "Ninety-Three", "talata w'tes'een"),
    (94, "٩٤", "أربعة وتسعين", "Ninety-Four", "arba'a w'tes'een"),
    (95, "٩٥", "خمسة وتسعين", "Ninety-Five", "khamsa w'tes'een"),
    (96, "٩٦", "ستة وتسعين", "Ninety-Six", "sitta w'tes'een"),
    (97, "٩٧", "سبعة وتسعين", "Ninety-Seven", "saba'a w'tes'een"),
    (98, "٩٨", "تمنية وتسعين", "Ninety-Eight", "tamanya w'tes'een"),
    (99, "٩٩", "تسعة وتسعين", "Ninety-Nine", "tes'a w'tes'een"),
    (100, "١٠٠", "مئة", "Hundred", "mi'a"),
]


class Command(BaseCommand):
    help = (
        'One-time/rerunnable dev tool: imports the fixed Egyptian Arabic 0-100 '
        'number dataset (ported from arabic-numbers-practice/src/numbers.ts) '
        'into the arabicnumbers database. Never run in production - the '
        'resulting arabicnumbers.sqlite3 is committed to git directly.'
    )

    def handle(self, *args, **options):
        for value, numeral, script, english, transliteration in NUMBERS:
            ArabicNumber.objects.update_or_create(
                value=value,
                defaults={
                    'numeral': numeral,
                    'script': script,
                    'english': english,
                    'transliteration': transliteration,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f'Imported {ArabicNumber.objects.count()} numbers.'
        ))
