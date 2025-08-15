from django.db import migrations
from django.utils.text import slugify

SKILL_CATEGORIES = {
    'Programming Languages': [
      'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust'
    ],
    'Frontend Development': [
      'React', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'Sass', 'Tailwind CSS', 'Bootstrap', 'jQuery'
    ],
    'Backend Development': [
      'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails'
    ],
    'Database': [
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra'
    ],
    'Cloud & DevOps': [
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD'
    ],
    'Design': [
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Prototyping'
    ],
    'Data Science': [
      'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'R'
    ],
    'Mobile Development': [
      'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin'
    ]
}


def seed_more_skills(apps, schema_editor):
  Skill = apps.get_model('fyndr_auth', 'Skill')
  for category, skills in SKILL_CATEGORIES.items():
    for name in skills:
      # Try to find by name first (unique)
      obj = Skill.objects.filter(name=name).first()
      if obj:
        # Update missing or default fields if needed
        changed = False
        if not obj.category:
          obj.category = category
          changed = True
        if obj.popularity is None or obj.popularity < 10:
          obj.popularity = max(obj.popularity or 0, 20)
          changed = True
        if not obj.slug:
          # Create a unique slug
          base = slugify(name) or name.lower().replace(' ', '-')
          slug = base
          i = 2
          while Skill.objects.filter(slug=slug).exclude(pk=obj.pk).exists():
            slug = f"{base}-{i}"
            i += 1
          obj.slug = slug
          changed = True
        if not obj.is_active:
          obj.is_active = True
          changed = True
        if changed:
          obj.save()
        continue

      # Create new with a unique slug
      base = slugify(name) or name.lower().replace(' ', '-')
      slug = base
      i = 2
      while Skill.objects.filter(slug=slug).exists():
        slug = f"{base}-{i}"
        i += 1
      Skill.objects.create(
        name=name,
        slug=slug,
        category=category,
        is_active=True,
        popularity=20,
      )


def unseed_more_skills(apps, schema_editor):
    # Leave skills in DB; no-op on reverse
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('fyndr_auth', '0016_merge_20250814_1518'),
    ]

    operations = [
        migrations.RunPython(seed_more_skills, unseed_more_skills),
    ]
