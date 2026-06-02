import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const router = useRouter();
	const [category, setCategory] = useState<string>('products');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	
	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const data: any = {
		products: [
			{
				id: '00f5a45ed8897f8090116a01',
				subject: 'Are the products displayed on Petoria verified and safe?',
				content: 'Yes, all products on Petoria are sourced from trusted brands and verified sellers only.',
			},
			{
				id: '00f5a45ed8897f8090116a22',
				subject: 'What types of pet products do you offer?',
				content: 'We offer food, medicine, toys, and accessories for dogs, cats, birds, and fish.',
			},
			{
				id: '00f5a45ed8897f8090116a21',
				subject: 'How can I search for products on Petoria?',
				content: 'Use the search bar or the Shop filter to narrow results by pet type, category, brand, size, or price.',
			},
			{
				id: '00f5a45ed8897f8090116a23',
				subject: 'Do you offer guidance on choosing the right product for my pet?',
				content: 'Yes, each product page includes a description and our AI chat assistant can recommend products based on your pet.',
			},
			{
				id: '00f5a45ed8897f8090116a24',
				subject: 'What should I consider when buying food for my pet?',
				content: 'Consider your pet\'s age, breed, weight, and any dietary restrictions. Check the ingredient list and nutritional info.',
			},
			{
				id: '00f5a45ed8897f8090116a25',
				subject: 'How long does delivery typically take?',
				content: 'Standard delivery takes 2–5 business days. Express options are available at checkout.',
			},
			{
				id: '00f5a45ed8897f8090116a29',
				subject: 'What happens if I receive a damaged or wrong product?',
				content: 'Contact our support team within 7 days of delivery and we will arrange a replacement or refund.',
			},
			{
				id: '00f5a45ed8897f8090116a28',
				subject: 'Do you carry products for exotic pets like birds and fish?',
				content: 'Yes, we have dedicated sections for bird and fish products including specialized food and accessories.',
			},
			{
				id: '00f5a45ed8897f8090116a27',
				subject: 'Can I sell my pet products on Petoria?',
				content: 'Yes! Register as a SELLER, complete your profile, and start listing your products from My Page.',
			},
			{
				id: '00f5a45ed8897f8090116b99',
				subject: 'Are products on sale always discounted?',
				content: 'Sale products have a verified discount applied. The original price is shown with a strikethrough next to the sale price.',
			},
		],
		payment: [
			{
				id: '00f5a45ed8897f8090116a02',
				subject: 'How can I make the payment?',
				content: 'you make the payment through an agent!',
			},
			{
				id: '00f5a45ed8897f8090116a91',
				subject: 'Are there any additional fees for using your services?',
				content: 'No, our services are free for buyers. Sellers pay a commission upon successful sale.',
			},
			{
				id: '00f5a45ed8897f8090116a92',
				subject: 'Is there an option for installment payments?',
				content: 'Yes, we offer installment payment plans for certain properties. Please inquire for more details.',
			},
			{
				id: '00f5a45ed8897f8090116a93',
				subject: 'Is my payment information secure on your website?',
				content:
					'Yes, we use industry-standard encryption technology to ensure the security of your payment information.',
			},
			{
				id: '00f5a45ed8897f8090116a94',
				subject: 'Can I make payments online through your website?',
				content: "Yes, you can securely make payments online through our website's payment portal.",
			},
			{
				id: '00f5a45ed8897f8090116a95',
				subject: "What happens if there's an issue with my payment?",
				content: 'If you encounter any issues with your payment, please contact our support team for assistance.',
			},
			{
				id: '00f5a45ed8897f8090116a96',
				subject: 'Do you offer refunds for payments made?',
				content:
					'Refund policies vary depending on the circumstances. Please refer to our refund policy or contact us for more information.',
			},
			{
				id: '00f5a45ed8897f8090116a97',
				subject: 'Are there any discounts or incentives for early payments?',
				content:
					'We occasionally offer discounts or incentives for early payments. Check our promotions or contact us for current offers.',
			},
			{
				id: '00f5a45ed8897f8090116a99',
				subject: 'How long does it take for payments to be processed?',
				content:
					'Payment processing times vary depending on the payment method used. Typically, credit/debit card payments are processed instantly',
			},
			{
				id: '00f5a45ed8897f8090116a98',
				subject: 'Are there penalties for late payments?',
				content:
					'Late payment penalties may apply depending on the terms of your agreement. Please refer to your contract or contact us for details.',
			},
		],
		buyers: [
			{
				id: '00f5a45ed8897f8090116a03',
				subject: 'What should I check before buying pet food?',
				content: 'Check the ingredient list, expiry date, your pet\'s age/weight suitability, and any allergen warnings.',
			},
			{
				id: '00f5a45ed8897f8090116a85',
				subject: 'How can I find products within my budget?',
				content: 'Use the price range filter on the Shop page to set a max price. You can also filter by "On Sale" for discounted items.',
			},
			{
				id: '00f5a45ed8897f8090116a84',
				subject: 'Do I need an account to buy products?',
				content: 'You need to be logged in to place orders and track purchases. Creating an account is free and takes under a minute.',
			},
			{
				id: '00f5a45ed8897f8090116a83',
				subject: 'How do I know which brand is right for my pet?',
				content: 'Each product page includes brand info and description. You can also ask our AI pet assistant for recommendations.',
			},
			{
				id: '00f5a45ed8897f8090116a82',
				subject: 'Can I track my order after purchase?',
				content: 'Yes. Go to My Page → Orders to see your order status and tracking updates in real time.',
			},
			{
				id: '00f5a45ed8897f8090116a81',
				subject: 'What are red flags when buying pet medicine online?',
				content: 'Watch out for missing dosage info, no brand name, unusually low prices, or sellers with no reviews.',
			},
			{
				id: '00f5a45ed8897f8090116a80',
				subject: 'Are product reviews on Petoria verified?',
				content: 'Reviews are submitted by registered users who have purchased the product, making them reliable.',
			},
			{
				id: '00f5a45ed8897f8090116a79',
				subject: 'How long does it take to find the right product?',
				content: 'Use filters and the search bar to narrow results quickly. Our AI assistant can also suggest products instantly.',
			},
			{
				id: '00f5a45ed8897f8090116a78',
				subject: 'What is the return policy if a product does not suit my pet?',
				content: 'Unopened products can be returned within 14 days. Contact support with your order ID to start a return.',
			},
			{
				id: '00f5a45ed8897f8090116a77',
				subject: 'Can I save products to buy later?',
				content: 'Yes, click the heart icon on any product to save it. Access your saved products from My Page → Favorites.',
			},
		],

		sellers: [
			{
				id: '00f5a45ed8897f8090116a04',
				subject: 'How do I become a seller on Petoria?',
				content: 'Register an account and select SELLER as your account type. After approval, you can list products from My Page.',
			},
			{
				id: '00f5a45ed8897f8090116a62',
				subject: 'What products am I allowed to sell on Petoria?',
				content: 'You can sell pet food, medicine, toys, and accessories. All products must meet our quality and safety guidelines.',
			},
			{
				id: '00f5a45ed8897f8090116a63',
				subject: 'How do I list a new product?',
				content: 'Go to My Page → Add New Product, fill in the product name, brand, category, price, stock, images, and description.',
			},
			{
				id: '00f5a45ed8897f8090116a64',
				subject: 'What are effective strategies for selling pet products?',
				content: 'Use high-quality photos, accurate descriptions, competitive pricing, and enable the Sale badge to attract buyers.',
			},
			{
				id: '00f5a45ed8897f8090116a65',
				subject: 'How do I manage my product inventory?',
				content: 'Update stock levels from My Page → My Products. Products with zero stock are automatically shown as Out of Stock.',
			},
			{
				id: '00f5a45ed8897f8090116a66',
				subject: 'How do I stay competitive in pricing?',
				content: 'Monitor similar products on the platform, use the Sale feature for promotions, and keep your product info up to date.',
			},
			{
				id: '00f5a45ed8897f8090116a67',
				subject: 'How do I handle buyer complaints?',
				content: 'Respond promptly and professionally. Use the platform messaging system to resolve issues and keep records of communication.',
			},
			{
				id: '00f5a45ed8897f8090116a68',
				subject: 'What tools does Petoria provide for sellers?',
				content: 'Sellers get a dashboard with product management, order tracking, status controls (ACTIVE/SOLD/DELETE), and analytics.',
			},
			{
				id: '00f5a45ed8897f8090116a69',
				subject: 'Can I mark a product as sold without deleting it?',
				content: 'Yes. From My Products, change the product status to SOLD. It will remain visible but cannot be purchased.',
			},
			{
				id: '00f5a45ed8897f8090116a70',
				subject: 'How can I grow my seller profile on Petoria?',
				content: 'Maintain good reviews, keep stock updated, respond to buyers quickly, and promote products through the community boards.',
			},
		],
		membership: [
			{
				id: '00f5a45ed8897f8090116a05',
				subject: 'Do you have a membership service on your site?',
				content: 'membership service is not available on our site yet!',
			},
			{
				id: '00f5a45ed8897f8090116a60',
				subject: 'What are the benefits of becoming a member on your website?',
				content: 'We currently do not offer membership benefits, but stay tuned for updates on any future offerings.',
			},
			{
				id: '00f5a45ed8897f8090116a59',
				subject: 'Is there a fee associated with becoming a member?',
				content: 'As membership services are not available, there are no associated fees at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a58',
				subject: 'Will membership provide access to exclusive content or features?',
				content: "We don't currently have membership-exclusive content or features.",
			},
			{
				id: '00f5a45ed8897f8090116a57',
				subject: 'How can I sign up for a membership on your site?',
				content: 'As of now, we do not have a sign-up process for memberships.',
			},
			{
				id: '00f5a45ed8897f8090116a56',
				subject: 'Do members receive discounts on products or services?',
				content: 'Membership discounts are not part of our current offerings, but watch for seasonal promotions.',
			},
			{
				id: '00f5a45ed8897f8090116a55',
				subject: 'Are there plans to introduce a membership program in the future?',
				content:
					"While we can't confirm any plans at this time, we're always exploring ways to enhance our services for users.",
			},
			{
				id: '00f5a45ed8897f8090116a54',
				subject: 'What kind of content or benefits can members expect if a membership program is introduced?',
				content: "We're evaluating potential benefits and features, but specifics are not available yet.",
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Do you offer a premium membership option on your platform?',
				content: 'Currently, we do not provide a premium membership option.',
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Will membership grant access to exclusive deals or discounts?',
				content: 'Membership perks, including deals or discounts, are not available at this time.',
			},
		],
		community: [
			{
				id: '00f5a45ed8897f8090116a06',
				subject: 'What should I do if there is abusive or criminal behavior in the community section?',
				content: 'If you encounter this situation, please report it immediately or contact the admin!',
			},
			{
				id: '00f5a45ed8897f8090116a44',
				subject: 'How can I participate in the community section of your website?',
				content: 'Create an account and engage in discussions.',
			},
			{
				id: '00f5a45ed8897f8090116a45',
				subject: 'Are there guidelines for posting?',
				content: 'Yes, follow our community guidelines.',
			},
			{
				id: '00f5a45ed8897f8090116a46',
				subject: 'What should I do if I encounter spam or irrelevant posts?',
				content: 'Report them to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a47',
				subject: 'Can I connect with other members outside of the community section?',
				content: 'Currently, no.',
			},
			{
				id: '00f5a45ed8897f8090116a48',
				subject: 'Can I share personal experiences or recommendations?',
				content: 'Yes, if relevant you can share personal experiences and recommendations.',
			},
			{
				id: '00f5a45ed8897f8090116a49',
				subject: 'How can I ensure privacy?',
				content: 'Avoid sharing sensitive information.',
			},
			{
				id: '00f5a45ed8897f8090116a50',
				subject: 'How can I contribute positively?',
				content: 'Respect others and engage constructively.',
			},
			{
				id: '00f5a45ed8897f8090116a51',
				subject: 'What if I notice misinformation?',
				content: 'Provide correct information or report to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a52',
				subject: 'Are there moderators?',
				content: 'Yes, we have moderators.',
			},
		],
		other: [
			{
				id: '00f5a45ed8897f8090116a40',
				subject: 'Who should I contact if I want to buy your site?',
				content: 'We have no plans to sell the site at this time!',
			},
			{
				id: '00f5a45ed8897f8090116a39',
				subject: 'Can I advertise my services on your website?',
				content: 'We currently do not offer advertising opportunities on our site.',
			},
			{
				id: '00f5a45ed8897f8090116a38',
				subject: 'Are there sponsorship opportunities available on your platform?',
				content: 'At this time, we do not have sponsorship opportunities.',
			},
			{
				id: '00f5a45ed8897f8090116a36',
				subject: 'Can I contribute guest posts or articles to your website?',
				content: "We're not accepting guest posts or articles at the moment.",
			},
			{
				id: '00f5a45ed8897f8090116a35',
				subject: 'Is there a referral program for recommending your website to others?',
				content: "We don't have a referral program in place currently.",
			},
			{
				id: '00f5a45ed8897f8090116a34',
				subject: 'Do you offer affiliate partnerships for promoting your services?',
				content: 'Affiliate partnerships are not available at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Can I purchase merchandise related to your website?',
				content: "We don't have merchandise available for purchase.",
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Are there any job openings or opportunities to work with your team?',
				content: 'Currently, we do not have any job openings or opportunities available.',
			},
			{
				id: '00f5a45ed8897f8090116a31',
				subject: 'Do you host events or webinars related to real estate?',
				content: "We're not hosting events or webinars at this time.",
			},
			{
				id: '00f5a45ed8897f8090116a30',
				subject: 'Can I request custom features or functionalities for your website?',
				content: "We're not accepting requests for custom features or functionalities.",
			},
		],
	};

	return (
		<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					<div
						className={category === 'products' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('products');
						}}
					>
						Products
					</div>
					<div
						className={category === 'payment' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('payment');
						}}
					>
						Payment
					</div>
					<div
						className={category === 'buyers' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('buyers');
						}}
					>
						For Buyers
					</div>
					<div
						className={category === 'sellers' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('sellers');
						}}
					>
						For Sellers
					</div>
					<div
						className={category === 'membership' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('membership');
						}}
					>
						Membership
					</div>
					<div
						className={category === 'community' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('community');
						}}
					>
						Community
					</div>
					<div
						className={category === 'other' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('other');
						}}
					>
						Other
					</div>
				</Box>
				<Box className={'wrap'} component={'div'}>
					{data[category] &&
						data[category].map((ele: any) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</Stack>
	);
};

export default Faq;
