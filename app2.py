import pandas as pd
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv
from tkinter import Tk, filedialog, simpledialog, messagebox, Label, Entry, Button, Text, END

# Initialize the BLIP model and processor
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Function to generate image caption
def generate_image_caption(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(image, return_tensors="pt")
    with torch.no_grad():
        out = model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption

# LinkedIn scraping function
def scrape_linkedin_company(company_name):
    chrome_driver_path = "C:/Windows/chromedriver.exe"  # Update with your exact path
    service = Service(chrome_driver_path)
    options = webdriver.ChromeOptions()
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    browser = webdriver.Chrome(service=service, options=options)

    LINKEDIN_EMAIL = "tasnim.khelil@esprit.tn"  # Replace with your LinkedIn email
    LINKEDIN_PASSWORD = "tVHAfZT49FHz?XY"  # Replace with your LinkedIn password

    def login_to_linkedin():
        browser.get('https://www.linkedin.com/login')
        email_field = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "username")))
        email_field.send_keys(LINKEDIN_EMAIL)
        password_field = browser.find_element(By.ID, "password")
        password_field.send_keys(LINKEDIN_PASSWORD)
        login_button = browser.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        try:
            WebDriverWait(browser, 15).until(EC.presence_of_element_located((By.ID, "global-nav-search")))
            print("✅ Login successful!")
        except:
            print("❌ Login failed. Check your credentials or if LinkedIn is blocking bots.")
            browser.quit()
            exit()

    def navigate_to_company(company_name):
        company_url = f"https://www.linkedin.com/company/{company_name}/posts/"
        browser.get(company_url)
        time.sleep(5)

    def scroll_feed(num_posts):
        SCROLL_PAUSE_TIME = 2
        loaded_posts = 0
        scroll_attempts = 0
        max_scroll_attempts = 10

        while loaded_posts < num_posts and scroll_attempts < max_scroll_attempts:
            browser.execute_script("window.scrollBy(0, 500);")
            time.sleep(SCROLL_PAUSE_TIME)
            try:
                WebDriverWait(browser, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.feed-shared-update-v2"))
                )
            except:
                print("⚠️ No posts found after scrolling.")
                break

            posts = browser.find_elements(By.CSS_SELECTOR, "div.feed-shared-update-v2")
            loaded_posts = len(posts)
            print(f"📄 {loaded_posts} posts loaded...")
            scroll_attempts += 1

        if loaded_posts >= num_posts:
            print(f"✅ Loaded {loaded_posts} posts.")
        else:
            print(f"⚠️ Stopped after {scroll_attempts} scroll attempts. Only {loaded_posts} posts loaded.")

    def extract_comments(post_element):
        comments = []
        try:
            comment_button = WebDriverWait(post_element, 10).until(
                EC.presence_of_element_located((By.XPATH, ".//button[contains(@aria-label, 'Commenter')]"))
            )
            browser.execute_script("arguments[0].scrollIntoView({block: 'center'});", comment_button)
            time.sleep(2)
            comment_button.click()
            time.sleep(3)

            while True:
                try:
                    load_more_button = WebDriverWait(browser, 5).until(
                        EC.presence_of_element_located((By.XPATH, "//button[contains(@class, 'comments-comments-list__load-more-comments-button--cr')]"))
                    )
                    browser.execute_script("arguments[0].scrollIntoView({block: 'center'});", load_more_button)
                    time.sleep(1)
                    browser.execute_script("arguments[0].click();", load_more_button)
                    time.sleep(3)
                except Exception:
                    print("✅ No more 'Load more comments' button found.")
                    break

            comment_elements = WebDriverWait(browser, 5).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "article.comments-comment-entity"))
            )

            for comment in comment_elements:
                try:
                    text_div = comment.find_element(By.CSS_SELECTOR, "div.update-components-text.relative")
                    full_text = text_div.get_attribute("innerText").strip()
                    comments.append(full_text)
                except Exception as e:
                    print(f"⚠️ Error extracting a comment: {e}")
                    continue

        except Exception as e:
            print(f"⚠️ Error extracting comments: {e}")

        return comments

    def extract_post_data(post_element):
        try:
            post_id = post_element.get_attribute("data-urn")
            author = post_element.find_element(By.CSS_SELECTOR, "span.update-components-actor__title").text.strip()
            content = post_element.find_element(By.CSS_SELECTOR, "div.feed-shared-update-v2__description").text.strip()
            comments = extract_comments(post_element)

            return {
                "Post ID": post_id,
                "Author": author,
                "Content": content,
                "Comments": comments
            }
        except Exception as e:
            print(f"⚠️ Error extracting post data: {e}")
            return None

    print("🔄 Logging in to LinkedIn...")
    login_to_linkedin()

    print(f"🔄 Navigating to {company_name}'s profile...")
    navigate_to_company(company_name)

    print("🔄 Loading posts...")
    scroll_feed(5)

    posts = WebDriverWait(browser, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.feed-shared-update-v2"))
    )[:5]

    posts_data = []
    for post in posts:
        post_data = extract_post_data(post)
        if post_data:
            posts_data.append(post_data)

    browser.quit()

    return posts_data

# Function to collect form data using Tkinter
def collect_form_data():
    root = Tk()
    root.title("Business Data Collection Form")

    # Create form fields
    fields = [
        "Business Name", "Business Description", "Address", "Industry", "Target Customer",
        "Customer Age Range", "Customer Country", "Marketing Budget", "Website",
        "Social Media Links", "Product Description"
    ]
    entries = {}

    for i, field in enumerate(fields):
        Label(root, text=field).grid(row=i, column=0, padx=10, pady=5)
        entry = Entry(root, width=50)
        entry.grid(row=i, column=1, padx=10, pady=5)
        entries[field] = entry

    # Add image selection button
    def select_image():
        image_path = filedialog.askopenfilename(title="Select Product Image")
        entries["Image Path"] = image_path
        Label(root, text=f"Selected: {image_path}").grid(row=len(fields), column=1, padx=10, pady=5)

    Button(root, text="Select Product Image", command=select_image).grid(row=len(fields), column=0, padx=10, pady=5)

    # Submit button
    def submit_form():
        # Collect data from entries
        form_data = {field: entries[field].get() for field in fields}
        form_data["Image Path"] = entries.get("Image Path", "")

        # Generate image caption
        caption = generate_image_caption(form_data["Image Path"])
        final_product_description = f"{form_data['Product Description']} {caption}"

        # Scrape LinkedIn data
        linkedin_company_name = form_data["Social Media Links"]
        scraped_data = scrape_linkedin_company(linkedin_company_name)

        # Simplify scraped data (only content and comments)
        simplified_scraped_data = []
        for post in scraped_data:
            simplified_scraped_data.append({
                "Content": post["Content"],
                "Comments": post["Comments"]
            })

        # Create a new row
        new_row = {
            "business_name": form_data["Business Name"],
            "business_description": form_data["Business Description"],
            "address": form_data["Address"],
            "industry": form_data["Industry"],
            "target_customer": form_data["Target Customer"],
            "customer_age_range": form_data["Customer Age Range"],
            "customer_country": form_data["Customer Country"],
            "marketing_budget": form_data["Marketing Budget"],
            "website": form_data["Website"],
            "social_media_str": form_data["Social Media Links"],
            "product_image": form_data["Image Path"],
            "product_description": form_data["Product Description"],
            "final_product_description": final_product_description,
            "Society_ScrapInfo": str(simplified_scraped_data)
        }

        # Save to CSV with business name
        filename = f"{form_data['Business Name']}_data.csv"
        new_df = pd.DataFrame([new_row])
        new_df.to_csv(filename, index=False)
        print(f"✅ Data saved to {filename}")

        root.quit()

    Button(root, text="Submit", command=submit_form).grid(row=len(fields) + 1, column=0, columnspan=2, pady=10)

    root.mainloop()

# Run the form collection function
collect_form_data()