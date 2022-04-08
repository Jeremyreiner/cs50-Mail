from django.forms import ModelForm
from django import forms
from .models import Post



class PostForm(ModelForm):
    class Meta:
        model = Post
        fields = ['content'] 
        widgets = {'content': forms.TextInput( attrs={'class' : 'form-control'})}

    def __init__(self, *args, **kwargs):
        super(PostForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
