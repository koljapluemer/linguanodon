from django import forms

from comprehensible_input.models import Video


class VideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ['youtube_id', 'title', 'language']
        widgets = {
            'youtube_id': forms.TextInput(attrs={'class': 'input w-full'}),
            'title': forms.TextInput(attrs={'class': 'input w-full'}),
            'language': forms.Select(attrs={'class': 'select w-full'}),
        }
