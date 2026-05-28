from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.emedicine.models import EMedicinePharmacy, MedicineItem
from apps.location.models import District, Upazila
from apps.payments.models import Payment, Subscription


User = get_user_model()


class Command(BaseCommand):
    help = 'Seed 22 pharmacy admin accounts with pharmacies, medicines, and annual subscriptions'

    password = 'Razon@123'
    image_urls = [
        'https://www.shutterstock.com/image-vector/building-exterior-front-view-interior-260nw-2487151817.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc8m013A4vlz4fnoLcz8XkDyx0fSpalT1RQAIC1utFzw&s',
    ]

    areas = [
        ('Gulshan', 'Gulshan Avenue, Dhaka', 23.8103, 90.4125),
        ('Banani', 'Road 11, Banani, Dhaka', 23.7937, 90.4066),
        ('Dhanmondi', 'Dhanmondi 27, Dhaka', 23.7461, 90.3742),
        ('Mirpur', 'Mirpur 10, Dhaka', 23.8067, 90.3686),
        ('Uttara', 'Sector 7, Uttara, Dhaka', 23.8759, 90.3795),
        ('Motijheel', 'Commercial Area, Motijheel, Dhaka', 23.7330, 90.4172),
        ('Badda', 'Pragati Sarani, Badda, Dhaka', 23.7806, 90.4266),
        ('Mohammadpur', 'Town Hall, Mohammadpur, Dhaka', 23.7658, 90.3589),
        ('Farmgate', 'Farmgate, Tejgaon, Dhaka', 23.7564, 90.3890),
        ('Wari', 'Rankin Street, Wari, Dhaka', 23.7115, 90.4177),
        ('Khilgaon', 'Khilgaon Chowdhury Para, Dhaka', 23.7509, 90.4248),
        ('Rampura', 'DIT Road, Rampura, Dhaka', 23.7610, 90.4217),
        ('Jatrabari', 'Jatrabari Medical Road, Dhaka', 23.7104, 90.4352),
        ('Lalbagh', 'Lalbagh Fort Road, Dhaka', 23.7189, 90.3881),
        ('Kawran Bazar', 'Kawran Bazar, Dhaka', 23.7516, 90.3937),
        ('Mohakhali', 'Wireless Gate, Mohakhali, Dhaka', 23.7789, 90.3978),
        ('Shyamoli', 'Ring Road, Shyamoli, Dhaka', 23.7748, 90.3657),
        ('Basabo', 'Central Basabo, Dhaka', 23.7406, 90.4292),
        ('Azimpur', 'Azimpur Road, Dhaka', 23.7280, 90.3854),
        ('Cantonment', 'Cantonment, Dhaka', 23.8297, 90.3938),
        ('Banasree', 'Block C, Banasree, Dhaka', 23.7632, 90.4316),
        ('Savar', 'Savar Bus Stand, Dhaka', 23.8479, 90.2577),
    ]

    common_medicines = [
        ('Paracetamol Tablet', 'Paracetamol', 'Beximco Pharma', 'tablet', '500', 'mg', '8.00', 'Pain reliever and fever reducer', 'Nausea, rash, stomach upset', 'Avoid overdose and severe liver disease'),
        ('ORS Saline', 'Oral Rehydration Salts', 'SMC', 'powder', '20.5', 'g', '6.00', 'Oral dehydration support', 'Generally well tolerated', 'Mix with clean water only'),
        ('Vitamin C Tablet', 'Ascorbic Acid', 'Incepta Pharma', 'tablet', '250', 'mg', '4.00', 'Vitamin C supplement', 'Acidity, nausea', 'Take after meals'),
        ('Zinc Tablet', 'Zinc Sulfate', 'Renata Limited', 'tablet', '20', 'mg', '5.00', 'Zinc supplement', 'Nausea, metallic taste', 'Take after food'),
        ('Antacid Suspension', 'Aluminum Hydroxide + Magnesium Hydroxide', 'ACI Limited', 'liquid', '200', 'ml', '95.00', 'Relief from acidity', 'Constipation or diarrhea', 'Shake well before use'),
        ('Calcium Tablet', 'Calcium Carbonate', 'Square Pharma', 'tablet', '500', 'mg', '6.00', 'Calcium supplement', 'Mild constipation', 'Take after meals'),
        ('Multivitamin Tablet', 'Multivitamin Complex', 'Beximco Pharma', 'tablet', '1', 'mg', '10.00', 'Daily nutritional supplement', 'Generally well tolerated', 'Do not exceed daily dose'),
        ('Povidone Iodine Solution', 'Povidone Iodine', 'ACI Limited', 'liquid', '100', 'ml', '80.00', 'External antiseptic wash', 'Skin irritation', 'External use only'),
        ('Normal Saline Drop', 'Sodium Chloride', 'Opsonin Pharma', 'liquid', '10', 'ml', '45.00', 'Nasal dryness support', 'Mild nasal irritation', 'Use clean dropper'),
        ('Glycerin Suppository', 'Glycerin', 'Renata Limited', 'capsule', '2', 'g', '12.00', 'Occasional constipation support', 'Local irritation', 'Use only when needed'),
    ]

    variant_medicines = [
        ('Napa Tablet', 'Paracetamol', 'Beximco Pharma', 'tablet', '500', 'mg', '7.00', 'Fever and mild pain relief', 'Rare allergic reaction', 'Use as directed'),
        ('Ace Tablet', 'Paracetamol', 'Square Pharma', 'tablet', '500', 'mg', '7.00', 'Fever and mild pain relief', 'Rare allergic reaction', 'Use as directed'),
        ('Vitamin B Complex', 'B Vitamins', 'Incepta Pharma', 'tablet', '1', 'mg', '8.00', 'Vitamin B supplement', 'Mild nausea', 'Take after meals'),
        ('Vitamin D Tablet', 'Cholecalciferol', 'Renata Limited', 'tablet', '400', 'iu', '9.00', 'Vitamin D supplement', 'Generally well tolerated', 'Do not exceed daily dose'),
        ('Iron Folic Tablet', 'Iron + Folic Acid', 'Square Pharma', 'tablet', '200', 'mg', '5.00', 'Nutritional supplement', 'Constipation, dark stool', 'Take after meals'),
        ('Electrolyte Powder', 'Electrolyte Mix', 'SMC', 'powder', '25', 'g', '12.00', 'Hydration support', 'Generally well tolerated', 'Mix with clean water only'),
        ('Antacid Tablet', 'Calcium Carbonate', 'ACI Limited', 'tablet', '500', 'mg', '4.00', 'Acidity relief', 'Constipation', 'Chew before swallowing'),
        ('Digestive Enzyme Syrup', 'Digestive Enzyme Blend', 'Drug International', 'syrup', '100', 'ml', '95.00', 'Digestive support', 'Mild stomach upset', 'Take after meals'),
        ('Cough Lozenges', 'Menthol', 'Square Pharma', 'tablet', '5', 'mg', '3.00', 'Throat soothing lozenge', 'Mouth irritation', 'Do not use for small children'),
        ('Honey Lemon Syrup', 'Honey + Lemon Extract', 'Incepta Pharma', 'syrup', '100', 'ml', '90.00', 'Throat comfort syrup', 'Mild stomach upset', 'Avoid if allergic to ingredients'),
        ('Saline Nasal Spray', 'Sodium Chloride', 'Opsonin Pharma', 'liquid', '30', 'ml', '120.00', 'Nasal dryness support', 'Mild irritation', 'Keep nozzle clean'),
        ('Eye Lubricant Drop', 'Carboxymethylcellulose', 'Aristopharma', 'liquid', '10', 'ml', '110.00', 'Dry eye comfort', 'Temporary blurred vision', 'Do not touch dropper tip'),
        ('Burn Relief Gel', 'Aloe Vera', 'ACI Limited', 'cream', '25', 'g', '70.00', 'Minor burn soothing gel', 'Skin irritation', 'External use only'),
        ('Antiseptic Cream', 'Cetrimide', 'Square Pharma', 'cream', '25', 'g', '65.00', 'Minor cut skin care', 'Skin irritation', 'External use only'),
        ('Calamine Lotion', 'Calamine', 'Beximco Pharma', 'liquid', '100', 'ml', '85.00', 'Itchy skin soothing lotion', 'Dry skin', 'External use only'),
        ('Oral Gel', 'Choline Salicylate', 'Renata Limited', 'cream', '10', 'g', '75.00', 'Mouth ulcer comfort gel', 'Mild burning', 'Use small amount'),
        ('Petroleum Jelly', 'White Soft Paraffin', 'ACI Limited', 'cream', '50', 'g', '55.00', 'Dry skin barrier care', 'Skin irritation', 'External use only'),
        ('Hand Sanitizer', 'Ethyl Alcohol', 'ACI Limited', 'liquid', '100', 'ml', '70.00', 'Hand hygiene sanitizer', 'Dry skin', 'Keep away from flame'),
        ('Thermometer Strip', 'Temperature Strip', 'Local Medical', 'powder', '1', 'mg', '30.00', 'Basic temperature checking aid', 'No known side effects', 'Single patient use preferred'),
        ('Glucose Powder', 'Dextrose', 'SMC', 'powder', '100', 'g', '55.00', 'Quick energy powder', 'Stomach upset', 'Use moderate quantity'),
        ('Lactose Free Nutrition', 'Nutrition Powder', 'Nestle Health', 'powder', '200', 'g', '260.00', 'General nutrition support', 'Bloating if overused', 'Follow serving direction'),
        ('Baby Saline Drop', 'Sodium Chloride', 'Opsonin Pharma', 'liquid', '10', 'ml', '42.00', 'Gentle nasal saline', 'Mild irritation', 'Use clean dropper'),
        ('Diaper Rash Cream', 'Zinc Oxide', 'Square Pharma', 'cream', '25', 'g', '90.00', 'Diaper rash barrier cream', 'Skin irritation', 'External use only'),
        ('Rehydration Zinc Pack', 'ORS + Zinc', 'SMC', 'powder', '22', 'g', '14.00', 'Hydration and zinc support', 'Nausea', 'Use clean water'),
        ('Surgical Spirit', 'Isopropyl Alcohol', 'ACI Limited', 'liquid', '100', 'ml', '75.00', 'External cleaning aid', 'Skin dryness', 'External use only'),
        ('Cotton Roll', 'Absorbent Cotton', 'Local Medical', 'powder', '50', 'g', '45.00', 'Wound dressing support', 'No known side effects', 'Keep sealed and clean'),
        ('Gauze Bandage', 'Sterile Gauze', 'Local Medical', 'powder', '5', 'g', '35.00', 'Wound dressing support', 'No known side effects', 'Use clean hands'),
        ('Elastic Bandage', 'Elastic Cotton Bandage', 'Local Medical', 'powder', '1', 'g', '120.00', 'Sprain support bandage', 'Tight wrapping discomfort', 'Do not wrap too tightly'),
        ('Medical Tape', 'Adhesive Medical Tape', 'Local Medical', 'powder', '1', 'g', '40.00', 'Dressing support tape', 'Skin irritation', 'External use only'),
        ('Digital Thermometer', 'Thermometer Device', 'Local Medical', 'powder', '1', 'mg', '180.00', 'Temperature checking aid', 'No known side effects', 'Clean before and after use'),
        ('Glucose Saline Powder', 'Glucose + Electrolytes', 'SMC', 'powder', '100', 'g', '65.00', 'Energy and hydration support', 'Stomach upset if overused', 'Mix with clean water'),
        ('Lemon ORS', 'Oral Rehydration Salts', 'SMC', 'powder', '20.5', 'g', '7.00', 'Lemon flavored hydration support', 'Generally well tolerated', 'Mix with clean water only'),
        ('Orange ORS', 'Oral Rehydration Salts', 'SMC', 'powder', '20.5', 'g', '7.00', 'Orange flavored hydration support', 'Generally well tolerated', 'Mix with clean water only'),
        ('Kids Vitamin Syrup', 'Multivitamin', 'Incepta Pharma', 'syrup', '100', 'ml', '145.00', 'Children nutrition supplement', 'Mild stomach upset', 'Use age-appropriate dose'),
        ('Adult Nutrition Powder', 'Balanced Nutrition', 'Nestle Health', 'powder', '400', 'g', '420.00', 'General adult nutrition support', 'Bloating if overused', 'Follow serving direction'),
        ('Protein Powder Sachet', 'Protein Supplement', 'Local Medical', 'powder', '25', 'g', '45.00', 'Protein nutrition support', 'Bloating if overused', 'Follow serving direction'),
        ('Baby Petroleum Jelly', 'White Soft Paraffin', 'ACI Limited', 'cream', '50', 'g', '60.00', 'Baby dry skin barrier care', 'Skin irritation', 'External use only'),
        ('Aloe Vera Gel', 'Aloe Vera', 'ACI Limited', 'cream', '50', 'g', '110.00', 'Skin soothing gel', 'Skin irritation', 'External use only'),
        ('Moisturizing Cream', 'Emollient Base', 'Square Pharma', 'cream', '50', 'g', '120.00', 'Dry skin moisturizing cream', 'Skin irritation', 'External use only'),
        ('Foot Care Cream', 'Urea + Emollient', 'ACI Limited', 'cream', '25', 'g', '95.00', 'Dry foot skin care', 'Skin irritation', 'External use only'),
        ('Lip Balm', 'White Soft Paraffin', 'Local Medical', 'cream', '10', 'g', '50.00', 'Dry lip care', 'Mild irritation', 'External use only'),
        ('Antiseptic Hand Wash', 'Chlorhexidine Wash', 'ACI Limited', 'liquid', '100', 'ml', '95.00', 'Hand hygiene wash', 'Dry skin', 'External use only'),
        ('Mouthwash', 'Oral Hygiene Solution', 'Square Pharma', 'liquid', '100', 'ml', '130.00', 'Oral hygiene support', 'Mouth irritation', 'Do not swallow'),
        ('Toothache Gel', 'Clove Oil Gel', 'Local Medical', 'cream', '10', 'g', '60.00', 'Temporary tooth comfort gel', 'Mouth irritation', 'Use small amount'),
        ('Throat Gargle', 'Salt Gargle Mix', 'Local Medical', 'powder', '10', 'g', '25.00', 'Throat comfort gargle mix', 'Mild mouth dryness', 'Do not swallow'),
        ('Steam Inhalation Capsule', 'Menthol + Eucalyptus', 'Local Medical', 'capsule', '1', 'mg', '6.00', 'Steam inhalation comfort', 'Eye irritation from vapor', 'Do not swallow capsule'),
        ('Vapor Rub', 'Menthol Rub', 'ACI Limited', 'cream', '25', 'g', '85.00', 'Chest comfort rub', 'Skin irritation', 'External use only'),
        ('Nasal Inhaler', 'Menthol Inhaler', 'Local Medical', 'liquid', '1', 'ml', '35.00', 'Nasal comfort inhaler', 'Mild irritation', 'Personal use only'),
        ('Baby Cough Comfort Syrup', 'Honey Herbal Blend', 'Incepta Pharma', 'syrup', '100', 'ml', '110.00', 'Throat comfort syrup', 'Mild stomach upset', 'Avoid under one year age'),
        ('Herbal Cough Syrup', 'Herbal Extract Blend', 'Local Medical', 'syrup', '100', 'ml', '95.00', 'Throat comfort syrup', 'Mild stomach upset', 'Avoid if allergic'),
        ('Fever Cooling Patch', 'Cooling Gel Patch', 'Local Medical', 'cream', '1', 'g', '45.00', 'Cooling comfort patch', 'Skin irritation', 'External use only'),
        ('Ice Gel Pack', 'Reusable Gel Pack', 'Local Medical', 'liquid', '100', 'ml', '140.00', 'Cold compress support', 'Cold burn if misused', 'Wrap before skin contact'),
        ('Hot Water Bag', 'Rubber Hot Bag', 'Local Medical', 'liquid', '1', 'ml', '220.00', 'Warm compress support', 'Burn risk', 'Do not use boiling water'),
        ('Hand Gloves', 'Disposable Gloves', 'Local Medical', 'powder', '1', 'g', '20.00', 'Hygiene support gloves', 'Latex irritation', 'Single use only'),
        ('Face Mask', 'Disposable Face Mask', 'Local Medical', 'powder', '1', 'g', '10.00', 'Basic face covering', 'Skin irritation', 'Single use only'),
        ('Alcohol Swab', 'Isopropyl Alcohol Swab', 'Local Medical', 'liquid', '1', 'ml', '5.00', 'Skin cleaning swab', 'Dry skin', 'External use only'),
        ('Wound Wash Saline', 'Sodium Chloride', 'Opsonin Pharma', 'liquid', '100', 'ml', '80.00', 'Wound rinsing support', 'Mild irritation', 'Use clean technique'),
        ('Band Aid Strip', 'Adhesive Bandage', 'Local Medical', 'powder', '1', 'g', '6.00', 'Small wound cover', 'Skin irritation', 'Single use only'),
        ('Crepe Bandage', 'Cotton Crepe Bandage', 'Local Medical', 'powder', '1', 'g', '95.00', 'Light support bandage', 'Tight wrapping discomfort', 'Do not wrap too tightly'),
        ('Triangular Bandage', 'Cotton Triangular Bandage', 'Local Medical', 'powder', '1', 'g', '75.00', 'First-aid support bandage', 'No known side effects', 'Keep clean and dry'),
        ('Safety Pin Pack', 'Safety Pins', 'Local Medical', 'powder', '1', 'g', '15.00', 'Bandage fastening aid', 'Puncture risk', 'Keep away from children'),
        ('First Aid Scissor', 'Medical Scissor', 'Local Medical', 'powder', '1', 'g', '90.00', 'First-aid cutting tool', 'Cut risk', 'Store safely'),
        ('Medicine Dropper', 'Plastic Dropper', 'Local Medical', 'liquid', '5', 'ml', '20.00', 'Liquid measuring aid', 'No known side effects', 'Wash after use'),
        ('Measuring Cup', 'Plastic Measuring Cup', 'Local Medical', 'liquid', '30', 'ml', '18.00', 'Liquid dose measuring aid', 'No known side effects', 'Wash after use'),
        ('Baby Feeding Spoon', 'Plastic Feeding Spoon', 'Local Medical', 'powder', '1', 'g', '25.00', 'Baby feeding aid', 'No known side effects', 'Wash before use'),
        ('Water Purification Tablet', 'Water Purification Agent', 'Local Medical', 'tablet', '1', 'mg', '3.00', 'Emergency water hygiene support', 'Taste change', 'Follow label directions'),
        ('Mosquito Repellent Cream', 'Repellent Blend', 'ACI Limited', 'cream', '25', 'g', '90.00', 'Mosquito bite prevention support', 'Skin irritation', 'External use only'),
        ('After Bite Gel', 'Calamine + Aloe', 'ACI Limited', 'cream', '20', 'g', '70.00', 'Insect bite soothing gel', 'Skin irritation', 'External use only'),
        ('Sanitary Pad Pack', 'Absorbent Pad', 'Local Medical', 'powder', '1', 'g', '120.00', 'Personal hygiene support', 'Skin irritation', 'Change regularly'),
        ('Baby Diaper Pack', 'Absorbent Diaper', 'Local Medical', 'powder', '1', 'g', '180.00', 'Baby hygiene support', 'Skin irritation', 'Change regularly'),
        ('Oral Rehydration Bottle', 'Ready ORS Solution', 'SMC', 'liquid', '250', 'ml', '30.00', 'Ready-to-drink hydration support', 'Generally well tolerated', 'Use before expiry'),
        ('Herbal Digestive Tablet', 'Herbal Digestive Blend', 'Local Medical', 'tablet', '250', 'mg', '4.00', 'Digestive comfort tablet', 'Mild stomach upset', 'Use after meals'),
        ('Fiber Powder', 'Psyllium Husk', 'Local Medical', 'powder', '100', 'g', '150.00', 'Dietary fiber support', 'Bloating', 'Take with enough water'),
        ('Lactase Tablet', 'Lactase Enzyme', 'Local Medical', 'tablet', '3000', 'iu', '12.00', 'Dairy digestion support', 'Generally well tolerated', 'Take with dairy food'),
        ('Probiotic Sachet', 'Probiotic Blend', 'Incepta Pharma', 'powder', '1', 'g', '25.00', 'Digestive flora support', 'Bloating', 'Use as directed'),
        ('Riboflavin Tablet', 'Vitamin B2', 'Renata Limited', 'tablet', '5', 'mg', '4.00', 'Vitamin B2 supplement', 'Bright urine color', 'Take after meals'),
        ('Folic Acid Tablet', 'Folic Acid', 'Square Pharma', 'tablet', '400', 'mcg', '3.00', 'Folic acid supplement', 'Mild nausea', 'Use as directed'),
        ('Magnesium Tablet', 'Magnesium', 'Incepta Pharma', 'tablet', '250', 'mg', '8.00', 'Magnesium supplement', 'Loose stool', 'Take after meals'),
        ('Omega Softgel', 'Omega 3', 'Local Medical', 'capsule', '1000', 'mg', '18.00', 'Nutrition supplement', 'Fishy aftertaste', 'Take after meals'),
        ('Baby Zinc Syrup', 'Zinc Sulfate', 'Renata Limited', 'syrup', '100', 'ml', '75.00', 'Zinc supplement syrup', 'Nausea', 'Use age-appropriate dose'),
        ('Vitamin C Syrup', 'Ascorbic Acid', 'Incepta Pharma', 'syrup', '100', 'ml', '85.00', 'Vitamin C syrup supplement', 'Acidity', 'Take after meals'),
    ]

    features = {
        'consultations_per_month': 100,
        'max_appointments': 200,
        'priority_support': True,
        'admin_tools': True,
        'pharmacy_dashboard': True,
        'medicine_inventory': True,
    }

    def handle(self, *args, **options):
        dhaka, _ = District.objects.get_or_create(
            name='Dhaka',
            defaults={'code': 'DHK', 'region': 'Central'},
        )
        upazila, _ = Upazila.objects.get_or_create(
            district=dhaka,
            code='DHK-SDR',
            defaults={'name': 'Dhaka Sadar'},
        )

        created_users = 0
        created_pharmacies = 0
        created_medicines = 0
        active_until = timezone.now() + timedelta(days=365)

        with transaction.atomic():
            for index in range(1, 23):
                email = f'pharmacy{index}@gmail.com'
                phone = f'+880181{index:08d}'
                area, address, latitude, longitude = self.areas[index - 1]

                user, user_created = User.objects.update_or_create(
                    email=email,
                    defaults={
                        'phone': phone,
                        'first_name': 'Pharmacy',
                        'last_name': f'Admin {index}',
                        'roles': ['pharmacy_admin'],
                        'district': 'Dhaka',
                        'upazila': area,
                        'address': address,
                        'is_active': True,
                        'is_verified': True,
                        'has_made_first_payment': True,
                    },
                )
                user.set_password(self.password)
                user.save()
                created_users += int(user_created)

                pharmacy, pharmacy_created = EMedicinePharmacy.objects.update_or_create(
                    admin_user=user,
                    defaults={
                        'name': f'Medi Sheba Pharmacy {index:02d}',
                        'pharmacy_type': ['independent', 'chain', 'hospital'][(index - 1) % 3],
                        'license_number': f'MS-PHARM-{index:03d}',
                        'phone_number': phone,
                        'email': email,
                        'address': address,
                        'district': dhaka,
                        'upazila': upazila,
                        'latitude': latitude,
                        'longitude': longitude,
                        'delivery_time_hours': 6 + (index % 4) * 3,
                        'min_order_amount': Decimal('100.00') + Decimal((index % 4) * 25),
                        'delivery_charge': Decimal('40.00') + Decimal((index % 5) * 5),
                        'is_available': True,
                        'is_verified': True,
                        'rating': round(4.6 + (index % 4) * 0.08, 2),
                        'review_count': 55 + index * 4,
                        'image_url': self.image_urls[(index - 1) % len(self.image_urls)],
                    },
                )
                created_pharmacies += int(pharmacy_created)

                target_count = 15 + ((index - 1) % 6)
                variant_count = target_count - len(self.common_medicines)
                start = ((index - 1) * 7) % len(self.variant_medicines)
                selected_variants = [
                    self.variant_medicines[(start + offset) % len(self.variant_medicines)]
                    for offset in range(variant_count)
                ]
                selected_medicines = self.common_medicines + selected_variants
                MedicineItem.objects.filter(pharmacy=pharmacy).delete()

                for medicine_index, medicine in enumerate(selected_medicines, start=1):
                    (
                        name,
                        generic_name,
                        manufacturer,
                        medicine_type,
                        strength,
                        strength_unit,
                        price,
                        description,
                        side_effects,
                        precautions,
                    ) = medicine
                    stock = 20 + ((index * 7 + medicine_index * 5) % 51)
                    MedicineItem.objects.create(
                        pharmacy=pharmacy,
                        name=name,
                        generic_name=generic_name,
                        manufacturer=manufacturer,
                        medicine_type=medicine_type,
                        strength=strength,
                        strength_unit=strength_unit,
                        price=Decimal(price),
                        description=description,
                        side_effects=side_effects,
                        precautions=precautions,
                        is_available=True,
                        stock=stock,
                    )
                    created_medicines += 1

                payment, _ = Payment.objects.update_or_create(
                    transaction_id=f'PHARM-ANNUAL-{index:02d}',
                    defaults={
                        'user': user,
                        'pharmacy': pharmacy,
                        'amount': Decimal('3999.00'),
                        'currency': 'BDT',
                        'gateway': 'sslcommerz',
                        'payment_type': 'subscription',
                        'reference_type': 'pharmacy_subscription',
                        'reference_id': str(pharmacy.id),
                        'status': 'success',
                        'paid_at': timezone.now(),
                        'gateway_reference': f'SEED-PHARM-{index:02d}',
                    },
                )

                Subscription.objects.update_or_create(
                    user=user,
                    plan='professional',
                    duration='annual',
                    defaults={
                        'amount': Decimal('3999.00'),
                        'status': 'active',
                        'end_date': active_until,
                        'renewal_date': active_until,
                        'payment': payment,
                        'features': self.features,
                        'is_trial': False,
                    },
                )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded 22 pharmacy admin accounts. New users: {created_users}, '
            f'new pharmacies: {created_pharmacies}, new medicines: {created_medicines}. '
            f'Password: {self.password}'
        ))
